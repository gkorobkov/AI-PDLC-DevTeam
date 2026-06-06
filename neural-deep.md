# neuraldeep.ru — LLM API Reference (for coding agents)

Base URL: `https://api.neuraldeep.ru/v1` (OpenAI-compatible)
Auth: `Authorization: Bearer $YOUR_KEY`

Available models:
- `gpt-oss-120b` — chat · tools · reasoning · 131k ctx · MXFP4 on 2×RTX 4090 48 GB
- `qwen3.6-35b-a3b` — chat · qwen3 tools · reasoning · 256k ctx · MoE 35B/3B-active · BF16 on 2× RTX 4090 48GB · vision (1 image/prompt)
- `e5-large` — multilingual embedding · 1024-dim · 3 replicas
- `bge-m3` — multilingual embedding · 1024-dim · 8k ctx
- `bge-reranker` — cross-encoder rerank
- `whisper-1` — WhisperX large-v3-turbo · multilingual · word timestamps · RTF ~16×

## Table of contents

- [Chat](#chat)
- [Embeddings](#embeddings)
- [Rerank](#rerank)
- [Transcription](#transcription)
- [Structured output](#structured-output)
- [Tools (agents)](#tools-agents)
- [Streaming](#streaming)
- [Rate Limits](#rate-limits)
- [Pricing (for budget calculation)](#pricing-for-budget-calculation)
- [Python SDK](#python-sdk)
- [JS SDK](#js-sdk)
- [Errors](#errors)
- [Privacy](#privacy)

## Chat

```
POST /v1/chat/completions
{
  "model": "gpt-oss-120b",
  "messages": [{"role":"user","content":"..."}],
  "max_tokens": 500,
  "temperature": 0.3
}
```

Note: gpt-oss reasoning tokens — set max_tokens >= 300, otherwise content will be empty.
Session sticky: send `user: <session_id>` → router will pin session to one upstream (prefix cache warm, up to 10× savings).

## Embeddings

```
POST /v1/embeddings
{"model": "e5-large", "input": ["text1","text2"]}
```

Response: `{"data": [{"embedding": [...], "index": 0}], ...}`. dim=1024 for both models. Cached (deterministic).

## Rerank

```
POST /v1/rerank
{"model":"bge-reranker","query":"...","documents":["doc1","doc2"]}
```

Response: `{"results": [{"index": 0, "relevance_score": 0.87}, ...]}` — sorted by relevance.

## Transcription

```
POST /v1/audio/transcriptions   (multipart)
file=@audio.wav
model=whisper-1
```

Response: `{"text": "...", "language": "en", "duration": 12.3, "segments": [...]}`.

## Structured output

```
POST /v1/chat/completions
{
  "model": "gpt-oss-120b",
  "messages": [...],
  "response_format": {"type":"json_schema","json_schema":{"name":"...","schema":{...},"strict":true}}
}
```

vLLM guarantees strict JSON when strict:true.

## Tools (agents)

Standard OpenAI tool-calling with `tools` + `tool_choice`.

```
{
  "model": "gpt-oss-120b",
  "messages": [...],
  "tools": [{"type":"function","function":{"name":"...","parameters":{...}}}],
  "tool_choice": "auto"
}
```

Response: `choices[0].message.tool_calls`.

## Streaming

Add `"stream": true` → SSE stream with `data: {...}` chunks, last `data: [DONE]`.

## Rate Limits

Two request counting windows: `session` (current 3-hour UTC window) and `week` (ISO week).
Specific numbers are abstracted — program retries based on response headers.

When `session` limit is exhausted — 2h cooldown (`Retry-After: 7200`, `X-Window: session`).
When `week` limit is exhausted — wait until Monday 00:00 UTC (`X-Window: week`).
Each response includes — `X-Tier`, `Retry-After`, `X-Window`.

## Pricing (for budget calculation)

- gpt-oss-120b / qwen3.6: $0.05 input · $0.20 output per 1M tokens
- e5-large / bge-m3: $0.03 input per 1M
- whisper: $0.003 per min

## Python SDK

```python
from openai import OpenAI
client = OpenAI(api_key="$YOUR_KEY", base_url="https://api.neuraldeep.ru/v1")
r = client.chat.completions.create(model="gpt-oss-120b", messages=[...], max_tokens=500)
```

## JS SDK

```typescript
import OpenAI from "openai";
const client = new OpenAI({ apiKey: "$YOUR_KEY", baseURL: "https://api.neuraldeep.ru/v1" });
```

## Errors

- 401 auth_error → bad / revoked key
- 401 key_model_access_denied → key not subscribed to this model (check your dashboard)
- 429 rate_limit → headers `X-Window: session|week` + `Retry-After: <sec>`
- 502 bad_gateway → upstream temporarily unavailable (LiteLLM does retry × 2 — usually passes)
- 400 context_window_exceeded → shorten messages

## Privacy

By default prompts/responses are **not stored**. In Dashboard two independent toggles:

- **Store request history** (default OFF) — if enabled, request/response body remains in DB and visible in your Dashboard logs. If disabled — body is deleted immediately after processing, only metrics remain in DB (model, tokens, status, latency).
- **Allow request analytics** — if enabled, we LLM-classify request type (code / research / agent …) for service development; body is used only for classification and deleted immediately (if storage is disabled). If disabled — prompt body is not read at all, categorization only by endpoint type.

We don't train on models, don't sell data. Metrics (latency, tokens, status) are always collected anonymously via Prometheus.
