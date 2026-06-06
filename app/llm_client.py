import json
import time
import logging
from typing import Optional, Dict, Any, List
from datetime import datetime
import requests

logger = logging.getLogger(__name__)

class LLMClient:
    """Vendor-neutral LLM client supporting OpenAI-compatible endpoints."""

    def __init__(self,
                 api_key: str,
                 model: str,
                 api_base_url: str = "https://api.openai.com/v1",
                 provider: str = "openai",
                 fallback_base_urls: Optional[List[str]] = None):
        self.api_key = api_key
        self.model = model
        self.api_base_url = api_base_url.rstrip('/')
        self.provider = provider
        self.fallback_base_urls = [
            url.rstrip("/")
            for url in (fallback_base_urls or [])
            if url and url.rstrip("/") != self.api_base_url
        ]
        self.headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }

    def complete(self,
                 prompt: str,
                 system_prompt: Optional[str] = None,
                 temperature: float = 0.7,
                 max_tokens: int = 2048,
                 json_mode: bool = False) -> Dict[str, Any]:
        """Call LLM and return structured response."""

        start_time = time.time()
        messages = []

        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        messages.append({"role": "user", "content": prompt})

        payload = {
            "model": self.model,
            "messages": messages,
            "temperature": temperature,
            "max_tokens": max_tokens,
        }

        if json_mode:
            payload["response_format"] = {"type": "json_object"}

        endpoints = [self.api_base_url, *self.fallback_base_urls]
        last_error = None

        for endpoint in endpoints:
            try:
                response = requests.post(
                    f"{endpoint}/chat/completions",
                    headers=self.headers,
                    json=payload,
                    timeout=60
                )
                response.raise_for_status()

                result = response.json()
                latency_ms = (time.time() - start_time) * 1000

                # Extract tokens
                prompt_tokens = result.get("usage", {}).get("prompt_tokens", 0)
                completion_tokens = result.get("usage", {}).get("completion_tokens", 0)
                total_tokens = result.get("usage", {}).get("total_tokens", 0)

                content = result["choices"][0]["message"]["content"]

                # If json_mode, parse the JSON response
                if json_mode:
                    try:
                        content = json.loads(content)
                    except json.JSONDecodeError:
                        logger.warning("Failed to parse JSON response")

                return {
                    "success": True,
                    "content": content,
                    "model": self.model,
                    "provider": self.provider,
                    "api_base_url": endpoint,
                    "latency_ms": latency_ms,
                    "prompt_tokens": prompt_tokens,
                    "completion_tokens": completion_tokens,
                    "total_tokens": total_tokens,
                    "timestamp": datetime.now().isoformat()
                }

            except (requests.exceptions.RequestException, KeyError, IndexError, ValueError) as e:
                last_error = e
                logger.error(f"LLM API call failed for {endpoint}: {str(e)}")

        latency_ms = (time.time() - start_time) * 1000

        return {
            "success": False,
            "error": str(last_error) if last_error else "No LLM endpoint configured",
            "error_type": type(last_error).__name__ if last_error else "ConfigurationError",
            "model": self.model,
            "provider": self.provider,
            "latency_ms": latency_ms,
            "timestamp": datetime.now().isoformat()
        }

    def get_key_limits(self, response_mode: str = "safe") -> Dict[str, Any]:
        """Return normalized API key limit data for providers that expose it."""
        provider = (self.provider or "").lower()
        include_provider_payload = response_mode == "full"

        if provider != "openrouter":
            return {
                "success": True,
                "supported": False,
                "provider": self.provider,
                "model": self.model,
                "message": "LLM key limits are currently implemented for OpenRouter only.",
                "timestamp": datetime.now().isoformat(),
            }

        try:
            response = requests.get(
                f"{self.api_base_url}/key",
                headers=self.headers,
                timeout=20,
            )
            response.raise_for_status()
            payload = response.json()
            data = payload.get("data", payload)

            usage = (
                data.get("usage")
                or data.get("usage_total")
                or data.get("byok_usage")
                or 0
            )
            limit = data.get("limit")
            limit_remaining = data.get("limit_remaining")

            result = {
                "success": True,
                "supported": True,
                "provider": self.provider,
                "model": self.model,
                "limit": limit,
                "limit_remaining": limit_remaining,
                "limit_reset": data.get("limit_reset"),
                "usage": usage,
                "usage_daily": data.get("usage_daily"),
                "usage_weekly": data.get("usage_weekly"),
                "usage_monthly": data.get("usage_monthly"),
                "byok_usage": data.get("byok_usage"),
                "byok_usage_daily": data.get("byok_usage_daily"),
                "byok_usage_weekly": data.get("byok_usage_weekly"),
                "byok_usage_monthly": data.get("byok_usage_monthly"),
                "is_free_tier": data.get("is_free_tier"),
                "rate_limit": data.get("rate_limit"),
                "expires_at": data.get("expires_at"),
                "timestamp": datetime.now().isoformat(),
            }

            if include_provider_payload:
                result["provider_payload"] = data

            return result
        except (requests.exceptions.RequestException, ValueError) as e:
            logger.error(f"LLM key limits lookup failed: {str(e)}")
            return {
                "success": False,
                "supported": True,
                "provider": self.provider,
                "model": self.model,
                "error": str(e),
                "timestamp": datetime.now().isoformat(),
            }

    def stream(self,
               prompt: str,
               system_prompt: Optional[str] = None,
               temperature: float = 0.7,
               max_tokens: int = 2048):
        """Stream response from LLM."""

        messages = []
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        messages.append({"role": "user", "content": prompt})

        payload = {
            "model": self.model,
            "messages": messages,
            "temperature": temperature,
            "max_tokens": max_tokens,
            "stream": True
        }

        try:
            response = requests.post(
                f"{self.api_base_url}/chat/completions",
                headers=self.headers,
                json=payload,
                stream=True,
                timeout=60
            )
            response.raise_for_status()

            for line in response.iter_lines():
                if line:
                    line = line.decode('utf-8')
                    if line.startswith("data: "):
                        data = line[6:]
                        if data == "[DONE]":
                            break
                        try:
                            json_data = json.loads(data)
                            if "choices" in json_data:
                                delta = json_data["choices"][0].get("delta", {})
                                if "content" in delta:
                                    yield delta["content"]
                        except json.JSONDecodeError:
                            pass

        except requests.exceptions.RequestException as e:
            logger.error(f"LLM streaming failed: {str(e)}")
            yield f"Error: {str(e)}"
