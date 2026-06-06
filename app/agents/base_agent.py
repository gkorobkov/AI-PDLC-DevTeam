from pathlib import Path
from string import Formatter
from typing import Any, Dict, Optional

from app.llm_client import LLMClient


class AgentExecutionError(Exception):
    """Structured error raised when an agent cannot complete a request."""

    def __init__(
        self,
        message: str,
        status_code: int = 500,
        details: Optional[Dict[str, Any]] = None,
    ):
        super().__init__(message)
        self.message = message
        self.status_code = status_code
        self.details = details or {}


class _SafeFormatDict(dict):
    def __missing__(self, key: str) -> str:
        return "{" + key + "}"


class BaseAgent:
    """Base class for PDLC agents.

    It centralizes prompt loading, template rendering, LLM calls, and response
    error mapping so API endpoints do not call the LLM directly.
    """

    prompt_dir = Path(__file__).resolve().parents[1] / "prompts"

    def __init__(
        self,
        llm_client: LLMClient,
        agent_name: str,
        stage: str,
    ):
        self.llm_client = llm_client
        self.agent_name = agent_name
        self.stage = stage

    def load_prompt(self, filename: str) -> str:
        prompt_path = self.prompt_dir / filename
        if not prompt_path.exists():
            raise AgentExecutionError(
                message=f"Prompt file not found: {filename}",
                status_code=500,
                details={"agent": self.agent_name, "prompt_path": str(prompt_path)},
            )
        return prompt_path.read_text(encoding="utf-8")

    def render_prompt(self, template: str, **values: Any) -> str:
        normalized = {
            key: self._normalize_template_value(value)
            for key, value in values.items()
        }
        return Formatter().vformat(template, (), _SafeFormatDict(normalized))

    def complete_json(
        self,
        prompt: str,
        system_prompt: str,
        temperature: float = 0.7,
        max_tokens: int = 2048,
    ) -> Dict[str, Any]:
        response = self.llm_client.complete(
            prompt=prompt,
            system_prompt=system_prompt,
            temperature=temperature,
            max_tokens=max_tokens,
            json_mode=True,
        )

        if not response.get("success"):
            raise AgentExecutionError(
                message="LLM request failed",
                status_code=502,
                details={
                    "agent": self.agent_name,
                    "stage": self.stage,
                    "provider": response.get("provider"),
                    "model": response.get("model"),
                    "error": response.get("error"),
                    "latency_ms": response.get("latency_ms"),
                },
            )

        content = response.get("content")
        if not isinstance(content, dict):
            raise AgentExecutionError(
                message="LLM returned non-JSON content",
                status_code=502,
                details={
                    "agent": self.agent_name,
                    "stage": self.stage,
                    "model": response.get("model"),
                    "latency_ms": response.get("latency_ms"),
                },
            )

        return {
            "content": content,
            "metadata": {
                "agent": self.agent_name,
                "stage": self.stage,
                "provider": response.get("provider"),
                "model": response.get("model"),
                "latency_ms": response.get("latency_ms", 0),
                "prompt_tokens": response.get("prompt_tokens", 0),
                "completion_tokens": response.get("completion_tokens", 0),
                "total_tokens": response.get("total_tokens", 0),
                "timestamp": response.get("timestamp"),
            },
        }

    @staticmethod
    def _normalize_template_value(value: Any) -> str:
        if value is None:
            return "N/A"
        if isinstance(value, str):
            stripped = value.strip()
            return stripped or "N/A"
        return str(value)
