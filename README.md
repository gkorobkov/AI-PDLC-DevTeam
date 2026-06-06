# Table of contents

- [Project: AI PDLC Development Team](#project-ai-pdlc-development-team)
  - [1. Goal](#1-goal)
  - [2. Stack](#2-stack)
  - [3. Architecture](#3-architecture)
  - [4. Environment Setup](#4-environment-setup)
  - [5. Database Bootstrap](#5-database-bootstrap)
  - [6. Running With Docker](#6-running-with-docker)
  - [7. Local Development](#7-local-development)
  - [8. Health Checks](#8-health-checks)
  - [9. Roadmap](#9-roadmap)
    - [9.1. Baseline: App Shell And Runtime](#91-baseline-app-shell-and-runtime)
    - [9.2. Agent Runtime Layer](#92-agent-runtime-layer)
    - [9.3. Requirement Analyst Agent](#93-requirement-analyst-agent)
    - [9.4. QA Agent](#94-qa-agent)
    - [9.5. Code Review Agent](#95-code-review-agent)
    - [9.6. AI Run Logging And Metrics Data](#96-ai-run-logging-and-metrics-data)
    - [9.7. Knowledge Base And RAG](#97-knowledge-base-and-rag)
    - [9.8. Guardrails And Human Approval](#98-guardrails-and-human-approval)
    - [9.9. Metrics Dashboard](#99-metrics-dashboard)
    - [9.10. CI, Evals, And Release Readiness](#910-ci-evals-and-release-readiness)
    - [9.11. Implementation Rules](#911-implementation-rules)
  - [10. Testing](#10-testing)
  - [11. Project Structure](#11-project-structure)
  - [12. Documentation](#12-documentation)
  - [13. Priorities](#13-priorities)
    - [13.1. Must Have](#131-must-have)
    - [13.2. Should Have](#132-should-have)
    - [13.3. Could Have](#133-could-have)
  - [14. Troubleshooting](#14-troubleshooting)
    - [14.1. Frontend cannot reach backend](#141-frontend-cannot-reach-backend)
    - [14.2. LLM API error](#142-llm-api-error)
    - [14.3. Database connection error](#143-database-connection-error)
    - [14.4. Old Webpack or Create React App errors](#144-old-webpack-or-create-react-app-errors)
    - [14.5. Ports already in use](#145-ports-already-in-use)
  - [15. Metrics](#15-metrics)
    - [15.1. Engineering Metrics](#151-engineering-metrics)
    - [15.2. AI Adoption Metrics](#152-ai-adoption-metrics)
    - [15.3. Quality Metrics](#153-quality-metrics)
    - [15.4. Operational Metrics](#154-operational-metrics)
  - [16. Primary Use Cases](#16-primary-use-cases)
    - [16.1. AI Requirement Analyst](#161-ai-requirement-analyst)
    - [16.2. AI Solution Architect](#162-ai-solution-architect)
    - [16.3. AI QA Agent](#163-ai-qa-agent)
    - [16.4. AI Code Review Agent](#164-ai-code-review-agent)
    - [16.5. AI DevOps / Release Agent](#165-ai-devops-release-agent)
    - [16.6. Incident Support Agent](#166-incident-support-agent)
  - [17. License](#17-license)

# Project: AI PDLC Development Team

## 1. Goal

The project is about how AI tools integrate into PDLC/SDLC and improve processes from idea to release, while maintaining human-in-the-loop and security.

Key PDLC stages supported by the platform:
- Business Idea
- Requirement Analyst Agent
- Solution Architect Agent
- Implementation / Coding Agent
- QA Agent
- Code Review Agent
- DevOps / Release Agent
- Metrics & Observability

## 2. Stack

- Backend: FastAPI
- UI: React
- Storage: PostgreSQL (Docker Compose)
- RAG / Knowledge Base: Qdrant
- LLM provider: OpenAI-compatible (OpenRouter, GigaChat, Ollama, others)

Recommendation: create `LLMClient` abstraction for vendor-neutral integration.

Observability (minimum for demo): `ai_runs` table, simple dashboard; for enterprise — Langfuse, Prometheus, Grafana, ELK, ClickHouse.

---

## 3. Architecture

Flow:

User / Manager
→ Dashboard UI
→ FastAPI
→ AI Orchestrator
→ Agents
→ LLM Client
→ RAG Knowledge Base
→ Guardrails
→ SQLite Logs
→ Metrics Dashboard

Core components:

1. Dashboard UI
   - business idea input;
   - PDLC stage selection;
   - agent execution;
   - result viewing;
   - metrics viewing.

2. FastAPI backend
   - /analyze-requirement
   - /generate-tests
   - /review-code
   - /ask-knowledge-base
   - /metrics
   - /ai-runs

3. AI Orchestrator
   - selects needed prompt template;
   - calls LLM;
   - applies guardrails;
   - saves result;
   - returns structured output.

4. Agents
   - Requirement Analyst Agent;
   - Solution Architect Agent;
   - QA Agent;
   - Code Review Agent;
   - DevOps / Release Agent;
   - Incident Support Agent.

5. RAG Knowledge Base
   - AI usage policy;
   - prompt library;
   - coding standards;
   - testing standards;
   - incident runbook;
   - definition of ready / definition of done;
   - AI risk checklist.

6. Guardrails
   - ban secrets;
   - mask personal data;
   - check for prompt injection;
   - require human approval for risky actions;
   - ban autonomous production code changes.

7. Metrics
   - number of AI runs;
   - distribution by PDLC stage;
   - average latency;
   - conditional time savings;
   - acceptance rate;
   - rejection rate;
   - human review required;
   - detected risks;
   - tokens / cost estimate.

## 4. Environment Setup

Create a local environment file:

```powershell
Copy-Item .env.example .env
```

Expected result: `.env` exists in the project root and can be edited without
changing the committed `.env.example` template.

Edit `.env` and configure:

```env
LLM_PROVIDER=openrouter
LLM_MODEL=openai/gpt-3.5-turbo
LLM_API_KEY=
LLM_API_BASE_URL=https://openrouter.ai/api/v1
# Controls GET /llm-limits response shape.
# safe: returns only app-safe normalized fields:
#   provider, model, limit, limit_remaining, limit_reset,
#   usage, usage_daily, usage_weekly, usage_monthly,
#   byok_usage*, is_free_tier, rate_limit, expires_at, timestamp.
#   Removes provider-only metadata such as key label, creator_user_id,
#   management/provisioning flags, and any future raw provider fields.
# full: returns all safe fields plus provider_payload with the original
#   provider response. Use only for local debugging, not production UI/API.
LLM_LIMITS_RESPONSE_MODE=safe

POSTGRES_HOST=
POSTGRES_PORT=
POSTGRES_DB=
POSTGRES_USER=
POSTGRES_PASSWORD=

PDLC_DB_NAME=
PDLC_DB_SCHEMA=
PDLC_DB_USER=
PDLC_DB_PASSWORD=

QDRANT_URL=http://localhost:6333
```

Expected result: backend, database bootstrap, Qdrant, and LLM settings all come
from `.env`; no credentials need to be hardcoded in application code.

`LLM_LIMITS_RESPONSE_MODE` controls the `/llm-limits` response:

- `safe`: returns only app-safe normalized fields and removes provider-only
  metadata such as key label, creator user id, management/provisioning flags,
  and future raw provider fields. Recommended for production.
- `full`: returns all `safe` fields plus `provider_payload` with the original
  provider response. Use only for local development and provider debugging.

Supported LLM providers:

- OpenAI: `https://api.openai.com/v1`
- OpenRouter: `https://openrouter.ai/api/v1`
- Ollama: `http://localhost:11434/v1`

## 5. Database Bootstrap

The app database objects are created by an idempotent SQL script:

```powershell
$maintenanceUrl = "postgresql://$env:POSTGRES_USER:$env:POSTGRES_PASSWORD@$env:POSTGRES_HOST:$env:POSTGRES_PORT/$env:POSTGRES_DB"

psql $maintenanceUrl `
  -v app_db="$env:PDLC_DB_NAME" `
  -v app_schema="$env:PDLC_DB_SCHEMA" `
  -v app_user="$env:PDLC_DB_USER" `
  -v app_password="$env:PDLC_DB_PASSWORD" `
  -f db/001_bootstrap_pg_ai-pdlc.sql
```

Expected result: PostgreSQL contains the configured application database,
schema, application role, and grants required by the backend.

The script creates or updates:

- configured application database
- configured application schema
- configured application role
- application grants and default privileges
- optional read-only user when `readonly_user` and `readonly_password` are passed

Optional read-only user:

```powershell
psql $maintenanceUrl `
  -v app_db="$env:PDLC_DB_NAME" `
  -v app_schema="$env:PDLC_DB_SCHEMA" `
  -v app_user="$env:PDLC_DB_USER" `
  -v app_password="$env:PDLC_DB_PASSWORD" `
  -v readonly_user="$env:PDLC_READONLY_USER" `
  -v readonly_password="$env:PDLC_READONLY_PASSWORD" `
  -f db/001_bootstrap_pg_ai-pdlc.sql
```

Expected result: read-only role can connect and query existing and future tables
in the `ai_pdlc` schema.

## 6. Running With Docker

Build and start the application services:

```powershell
docker compose up --build
```

Expected result: Docker builds both application images and starts `backend` and
`frontend`; `backend` becomes healthy before `frontend` is considered ready.

Open:

- Dashboard: `http://localhost:3000`
- API: `http://localhost:8000`
- API docs: `http://localhost:8000/docs`

Useful Docker commands:

```powershell
docker compose ps
docker compose logs -f backend
docker compose logs -f frontend
docker compose restart backend
docker compose down
```

Expected result: these commands show service state, stream logs, restart the
backend, or stop the app services without touching shared infrastructure.

## 7. Local Development

Build the backend:

```powershell
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
```

Run the backend:

```cmd
python -m app.main
```

Expected result: the backend runs on `http://localhost:8000` 
and serves
`http://localhost:8000/health`, 
`http://localhost:8000/status`, 
`http://localhost:8000/test-llm`, 
`http://localhost:8000/docs`.

Run the frontend in another terminal:

```powershell
npm install --prefix ./ui
npm start --prefix ./ui
```

Expected result: Vite starts the dashboard on `http://localhost:3000` and
proxies API calls to the local backend.

Or use:

```powershell
.\run-front.cmd
```

Expected result: the same Vite frontend dev server starts from a Windows helper
script.

The frontend uses Vite. Both `npm start` and `npm run dev` start the local
development server on `http://localhost:3000`.

## 8. Health Checks

Check backend health:

```powershell
curl http://localhost:8000/health
```

Expected response:

```json
{
  "status": "healthy",
  "environment": "development",
  "timestamp": "2026-06-06T10:30:00",
  "services": {
    "backend": "operational",
    "database": "configured",
    "llm": "openrouter"
  }
}
```

Check LLM connectivity:

```powershell
curl http://localhost:8000/test-llm
```

Expected result: the response confirms that the configured LLM provider can be
called from the backend. If it fails, check `LLM_API_KEY`, `LLM_API_BASE_URL`,
and provider availability.

Check LLM limits:

```powershell
curl http://localhost:8000/llm-limits
```

Expected result: the response shows current provider, model, limit, remaining
credit, and usage. In `LLM_LIMITS_RESPONSE_MODE=full`, it also includes
`provider_payload` with the provider's original fields.

## 9. Roadmap

Use this plan as the implementation order. Each step states what is created or
changed, what the result should be, and how to verify it before moving on.

### 9.1. Baseline: App Shell And Runtime

Status: done.

Create/modify:

- FastAPI backend in `app/`
- React/Vite dashboard in `ui/`
- Dockerfiles and `docker-compose.yml`
- `.env.example`, `.env`, and DB bootstrap SQL under `db/`

Done when:

- backend starts on `http://localhost:8000`
- frontend starts on `http://localhost:3000`
- `/health` returns `healthy`

Verify:

```powershell
docker compose up --build
curl http://localhost:8000/health
npm audit --prefix ./ui
npm run build --prefix ./ui
```

Expected result: Docker build succeeds, `/health` returns `healthy`, frontend
audit reports no vulnerabilities, and Vite production build completes.

### 9.2. Agent Runtime Layer

Status: done.

Create/modify:

- `app/agents/base_agent.py`: common agent interface, validation, prompt loading,
  response parsing, error mapping
- `app/orchestrator.py`: route requests to the right agent and centralize
  guardrails, logging, and LLM calls
- `app/llm_client.py`: keep one vendor-neutral LLM integration point with JSON
  mode, latency, token usage, streaming, and fallback-provider support
- prompt files under a dedicated prompt directory instead of hardcoded endpoint
  prompts

Done when:

- every agent can be called through one shared pattern
- LLM provider/model configuration comes only from settings
- LLM failures return structured API errors

Verify:

```powershell
curl http://localhost:8000/test-llm
pytest tests/ -v
```

Expected result: `/test-llm` returns a successful provider response and tests
cover the shared agent/LLM runtime behavior.

Implementation pattern:

```python
from app.config import settings
from app.llm_client import LLMClient

llm = LLMClient(
    api_key=settings.llm_api_key,
    model=settings.llm_model,
    api_base_url=settings.llm_api_base_url,
    provider=settings.llm_provider,
)

response = llm.complete(
    prompt="Your prompt",
    system_prompt="System context",
    json_mode=True,
    temperature=0.7,
    max_tokens=2048,
)

if response["success"]:
    result = response["content"]
    tokens = response["total_tokens"]
    latency = response["latency_ms"]
```

### 9.3. Requirement Analyst Agent

Status: WIP.

Create/modify:

- `app/agents/requirement_analyst.py`: full agent implementation
- `POST /analyze-requirement`: delegate to the agent
- request/response Pydantic models for business idea, product context, and
  constraints
- UI Requirement tab result rendering

Output contract:

- problem statement
- user story
- acceptance criteria
- edge cases
- risks
- dependencies
- suggested tasks
- human review flag

Done when:

- the endpoint returns valid structured JSON for normal and sparse input
- invalid input is rejected with a clear 4xx response
- the dashboard displays all returned sections

Use in the dashboard:

1. Open `http://localhost:3000`.
2. Go to the Requirement Analyst tab.
3. Enter a business idea, product context, and constraints.
4. Run the analysis.

Expected result: the page shows a structured requirements analysis with a
problem statement, user story, acceptance criteria, edge cases, risks,
dependencies, suggested tasks, and human-review flag.

Use via API:

```powershell
curl -X POST http://localhost:8000/analyze-requirement `
  -H "Content-Type: application/json" `
  -d '{
    "business_idea": "Add ability to dispute bonus charges",
    "product_context": "B2C loyalty program",
    "constraints": "Must integrate with payment system"
  }'
```

Expected result: HTTP `200` with JSON containing `success: true`, structured
requirement data, and request latency. Invalid or empty input should return a
clear validation error.

### 9.4. QA Agent

Create/modify:

- `app/agents/qa_agent.py`: generate tests from user story and acceptance
  criteria
- `POST /generate-tests`
- QA tab in the dashboard
- tests for successful output parsing and malformed LLM output

Output contract:

- positive tests
- negative tests
- boundary tests
- API tests
- regression tests
- pytest skeleton

Done when:

- the endpoint generates test cases from Requirement Analyst output
- dashboard QA tab accepts story/criteria and renders tests
- generated pytest skeleton is returned as a code block/string

Verify:

```powershell
curl -X POST http://localhost:8000/generate-tests `
  -H "Content-Type: application/json" `
  -d '{"user_story": "As a user I want to dispute a bonus charge", "acceptance_criteria": ["User can submit dispute", "User sees status"]}'
```

Expected result: HTTP `200` with positive, negative, boundary, API, and
regression tests plus a pytest skeleton.

### 9.5. Code Review Agent

Create/modify:

- `app/agents/code_review_agent.py`: review snippets or diffs
- `POST /review-code`
- Code Review tab in the dashboard
- optional standards lookup from `knowledge/coding_standards.md`

Output contract:

- summary
- issues with severity
- security risks
- maintainability risks
- test coverage gaps
- recommendation: `approved` or `changes_requested`

Done when:

- the agent identifies obvious defects and hardcoded secrets
- output is classified by severity, not just free text
- dashboard renders issues and final recommendation

Verify:

```powershell
curl -X POST http://localhost:8000/review-code `
  -H "Content-Type: application/json" `
  -d '{"language": "python", "code": "API_KEY = \"secret\"\ndef foo(): pass"}'
```

Expected result: HTTP `200` with at least one high-severity security issue for
the hardcoded secret and recommendation `changes_requested`.

### 9.6. AI Run Logging And Metrics Data

Create/modify:

- SQLAlchemy model for `ai_runs`
- logging service in `app/observability/ai_run_logger.py`
- database session setup in `app/observability/db.py`
- `/ai-runs` endpoint for querying recent runs
- logging hook in every agent call

Store:

- stage, agent name, input hash, model, prompt template
- latency and token usage
- estimated cost
- status and error message
- human approval flag and decision
- detected risks
- output payload

Done when:

- every agent call writes one row
- failed calls are logged with status and error
- `/ai-runs` returns recent runs for the dashboard

Verify:

```powershell
curl http://localhost:8000/ai-runs
```

Expected result: HTTP `200` with recent AI run records, including successful and
failed agent calls after they execute.

### 9.7. Knowledge Base And RAG

Create/modify:

- ingestion for files in `knowledge/`
- Qdrant collection setup
- `app/rag/knowledge_base.py`
- `POST /ask-knowledge-base`
- RAG-backed standards lookup for Code Review and governance questions

Knowledge files:

- `ai_pdlc_policy.md`
- `prompt_library.md`
- `coding_standards.md`
- `testing_standards.md`
- `incident_runbook.md`
- `definition_of_ready_done.md`
- `ai_risk_checklist.md`

Done when:

- knowledge files are indexed
- answers cite or summarize only retrieved project knowledge
- unknown questions get a bounded "not found in knowledge base" response

Verify:

```powershell
curl -X POST http://localhost:8000/ask-knowledge-base `
  -H "Content-Type: application/json" `
  -d '{"question": "When does AI require human review?"}'
```

Expected result: HTTP `200` with an answer grounded in files from `knowledge/`;
unsupported questions should be bounded instead of hallucinated.

### 9.8. Guardrails And Human Approval

Create/modify:

- `app/guardrails/secrets_checker.py`
- `app/guardrails/pii_masker.py`
- `app/guardrails/prompt_injection_checker.py`
- approval policy for risky actions
- guardrail hooks in orchestrator before and after LLM calls

Detect:

- API keys, tokens, passwords, private keys
- email, phone, passport-like identifiers
- prompt injection phrases such as "ignore previous instructions" and "show
  system prompt"
- production, financial, personal-data, migration, deletion, and security-risk
  actions that require human approval

Done when:

- risky input is blocked, masked, or marked for approval
- guardrail results are logged in `ai_runs`
- demo scenarios show AI is controlled rather than autonomous

Verify:

```powershell
pytest tests/ -v
```

Expected result: guardrail tests pass for secrets, PII, prompt injection, and
human-approval classification cases.

### 9.9. Metrics Dashboard

Create/modify:

- metrics API endpoints backed by `ai_runs`
- Metrics tab in React dashboard
- charts/tables for AI runs, effectiveness, risk and safety, and developer
  experience

Show:

- runs by PDLC stage and agent
- accepted vs rejected outputs
- latency, token usage, and estimated cost
- generated tests and review issues found
- secrets, PII, prompt injection attempts, and human approvals

Done when:

- metrics are computed from stored run data
- dashboard can explain adoption, quality, risk, and operational cost

Verify:

```powershell
curl http://localhost:8000/metrics
```

Expected result: HTTP `200` with aggregated metrics from `ai_runs`, suitable for
the Metrics dashboard tab.

### 9.10. CI, Evals, And Release Readiness

Create/modify:

- CI workflow for backend tests, frontend audit/build, guardrail tests, eval
  smoke tests, and Docker build
- `evals/test_cases.yml`
- eval runner or pytest integration
- release, rollback, and demo checklist documentation

Eval scenarios:

- Requirement Analyst returns user story and acceptance criteria.
- QA Agent returns at least five useful tests.
- Code Review Agent detects a hardcoded secret.
- RAG answers only from the knowledge base.
- Prompt injection is blocked.

Done when:

- CI gives a clear pass/fail signal for core AI behavior
- demo can be run end to end in 10-15 minutes
- release readiness is documented

Verify:

```powershell
pytest tests/ -v
npm audit --prefix ./ui
npm run build --prefix ./ui
docker compose build
```

Expected result: backend tests pass, frontend audit is clean, frontend build
succeeds, and Docker images build successfully.

### 9.11. Implementation Rules

- Keep prompts in files, not embedded in endpoint handlers.
- Use Pydantic models for every request and response.
- Call LLMs only through `LLMClient`.
- Route agent execution through the orchestrator.
- Log every successful and failed AI call.
- Add guardrails before expanding autonomous behavior.
- Do not move to the next step until the current step has a runnable endpoint,
  UI state where applicable, tests or smoke checks, and README examples updated.

## 10. Testing

Run backend tests:

```powershell
pytest tests/ -v
```

Expected result: backend unit and integration tests pass.

Run with coverage:

```powershell
pytest tests/ --cov=app
```

Expected result: backend tests pass and coverage is reported for `app`.

Run frontend audit and build:

```powershell
npm audit --prefix ./ui
npm run build --prefix ./ui
```

Expected result: frontend audit reports no vulnerabilities and Vite production
build succeeds.

## 11. Project Structure

```text
.
|-- app/                 FastAPI backend
|-- db/                  PostgreSQL bootstrap scripts
|-- docs/                Architecture and operating-model docs
|-- evals/               Evaluation assets
|-- knowledge/           Knowledge-base source files
|-- tests/               Backend tests
|-- ui/                  React/Vite dashboard
|-- docker-compose.yml   Backend/frontend compose file
|-- Dockerfile.backend   Backend container image
|-- requirements.txt     Python dependencies
|-- run-front.cmd        Windows helper for frontend dev server
`-- .env.example         Environment template
```

## 12. Documentation

- `docs/architecture.md`: technical architecture
- `docs/ai_pdlc_operating_model.md`: AI implementation model
- `docs/security_and_guardrails.md`: security and guardrails
- `docs/metrics_model.md`: metrics and KPIs
- `docs/demo_script.md`: demo script
- `db/README.md`: database bootstrap notes


---

## 13. Priorities

### 13.1. Must Have

Implement mandatory:

1. Dashboard UI.
2. FastAPI backend.
3. Requirement Analyst Agent.
4. QA Agent.
5. Code Review Agent.
6. AI run logging.
7. Metrics dashboard.
8. README.
9. Demo script.
10. Guardrails at least at basic regex-check level.

### 13.2. Should Have

Implement if time permits:

1. RAG Knowledge Base.
2. CI/CD pipeline.
3. eval smoke tests.
4. Incident Support Agent.
5. DevOps / Release Agent.

### 13.3. Could Have

Implement only if everything above is done:

1. Langfuse.
2. Grafana.
3. PostgreSQL.
4. Docker Compose.
5. beautiful C4 diagram.
6. demo video / GIF.

---

## 14. Troubleshooting

### 14.1. Frontend cannot reach backend

Check that the backend is running on `http://localhost:8000`:

```powershell
curl http://localhost:8000/health
```

### 14.2. LLM API error

Check:

- `LLM_API_KEY` is set in `.env`
- `LLM_API_BASE_URL` matches the provider
- the provider is reachable from the container or host

View backend logs:

```powershell
docker compose logs -f backend
```

### 14.4. Old Webpack or Create React App errors

The frontend now uses Vite. If you see `Html Webpack Plugin` or
`react-scripts` errors, stop old Node processes and reinstall dependencies:

```powershell
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force
Remove-Item -Recurse -Force ui\node_modules
npm install --prefix ./ui
npm start --prefix ./ui
```

### 14.5. Ports already in use

Default ports:

- frontend: `3000`
- backend: `8000`

Change port mappings in `docker-compose.yml` if those ports are already used.

## 15. Metrics

### 15.1. Engineering Metrics

- lead time estimate;
- cycle time estimate;
- review time estimate;
- test generation time;
- defect prevention estimate;
- number of generated test cases;
- number of detected review issues.

### 15.2. AI Adoption Metrics

- AI runs by PDLC stage;
- active users;
- adoption rate;
- accepted AI outputs;
- rejected AI outputs;
- outputs requiring rework.

### 15.3. Quality Metrics

- human approval rate;
- hallucination risk flag;
- grounding score for RAG answers;
- prompt injection detected;
- secrets detected;
- PII detected.

### 15.4. Operational Metrics

- latency;
- error rate;
- token usage;
- estimated cost;
- model used;
- fallback model used.


## 16. Primary Use Cases

### 16.1. AI Requirement Analyst

Input:

"We need to add to a B2C product the ability for users to dispute incorrect bonus charges."

Output:

- problem statement;
- user story;
- acceptance criteria;
- edge cases;
- risks;
- dependencies;
- draft backlog;
- required integrations;
- non-functional requirements.

What it demonstrates:

- discovery understanding;
- requirements analysis;
- AI connection to product process;
- structured output;
- human review.

---

### 16.2. AI Solution Architect

Input:

output from Requirement Analyst Agent.

Output:

- solution context;
- API endpoints;
- C4-style description;
- ADR (Architecture Decision Record);
- NFR (Non-Functional Requirements);
- integration risks;
- data flow;
- security concerns.

What it demonstrates:

- architectural background;
- ability to translate business idea into technical solution;
- design quality control.

---

### 16.3. AI QA Agent

Input:

user story + acceptance criteria.

Output:

- positive test cases;
- negative test cases;
- boundary cases;
- API tests;
- regression tests;
- Gherkin scenarios;
- pytest skeleton.

What it demonstrates:

- AI application in QA automation;
- measurable effect in test design;
- connection between requirements and tests.

---

### 16.4. AI Code Review Agent

Input:

code fragment or git diff.

Output:

- found issues;
- risk level;
- security concerns;
- maintainability issues;
- test coverage suggestions;
- recommendation: approve / changes requested.

What it demonstrates:

- AI in code review;
- engineering standards;
- security;
- human-in-the-loop.

---

### 16.5. AI DevOps / Release Agent

Input:

service description.

Output:

- Dockerfile checklist;
- CI/CD pipeline checklist;
- release checklist;
- rollback plan;
- monitoring checklist;
- readiness for production.

What it demonstrates:

- DevOps mindset;
- CI/CD;
- production readiness;
- managed change implementation.

---

### 16.6. Incident Support Agent

Input:

"After release, error rate and latency increased on /bonus-disputes endpoint."

Output:

- incident classification;
- possible causes;
- triage steps;
- rollback criteria;
- communication template;
- which metrics to check;
- which logs to examine.

What it demonstrates:

- operational mindset;
- observability;
- support;
- AI in incident management.


---

## 17. License

MIT
