# Architecture Overview

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         User / Manager                           │
└────────────────┬────────────────────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────────────────────┐
│                    Dashboard UI (React)                          │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────┐  │
│  │   Requirement    │  │   QA Agent       │  │ Code Review  │  │
│  │   Analyzer       │  │   Interface      │  │ Interface    │  │
│  └──────────────────┘  └──────────────────┘  └──────────────┘  │
└────────────────┬────────────────────────────────────────────────┘
                 │ HTTP/REST
┌────────────────▼────────────────────────────────────────────────┐
│                    FastAPI Backend                               │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │              AI Orchestrator                               │ │
│  │  - Route requests to agents                               │ │
│  │  - Apply guardrails                                       │ │
│  │  - Log all runs                                           │ │
│  └────────────────────────────────────────────────────────────┘ │
│                        │                                         │
│  ┌─────────────────────┼─────────────────────┬────────────────┐ │
│  │                     │                     │                │ │
│  ▼                     ▼                     ▼                ▼ │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌────┐ │
│  │ LLM Client   │  │   Guardrails │  │   RAG KB     │  │OBS.│ │
│  │ (vendor-     │  │ - Secrets    │  │ (Knowledge   │  │    │ │
│  │  neutral)    │  │ - PII        │  │  base)       │  │    │ │
│  │              │  │ - Injection  │  │              │  │    │ │
│  │              │  │ - Approval   │  │              │  │    │ │
│  └──────────────┘  └──────────────┘  └──────────────┘  └────┘ │
└────────────────┬────────────────────────────────────────────────┘
                 │
    ┌────────────┼────────────┐
    │            │            │
    ▼            ▼            ▼
┌─────────┐  ┌──────────┐  ┌────────────┐
│   LLM   │  │PostgreSQL│  │  Qdrant    │
│ Provider│  │ (ai_runs)│  │(Vector DB) │
│ (OpenAI │  │          │  │            │
│OpenRouter)  │          │  │            │
└─────────┘  └──────────┘  └────────────┘
```

## Components

### 1. Frontend (React Dashboard)

- **Location**: `ui/`
- **Purpose**: User interface for AI agents
- **Tabs**:
  - Requirement Analyst
  - QA Agent
  - Code Review Agent
  - Metrics Dashboard
- **Tech**: React 18, Axios for API calls

### 2. Backend (FastAPI)

- **Location**: `app/`
- **Purpose**: REST API and agent orchestration
- **Key files**:
  - `main.py`: FastAPI app, routes, lifecycle
  - `config.py`: Configuration management
  - `llm_client.py`: Vendor-neutral LLM client

### 3. LLM Client

- **Purpose**: Abstraction over LLM providers (OpenAI, OpenRouter, Ollama, etc.)
- **Features**:
  - Unified interface for all OpenAI-compatible APIs
  - Token counting and latency measurement
  - JSON mode support
  - Streaming support

### 4. AI Orchestrator

- Receives requests from UI
- Routes to appropriate agent
- Applies guardrails
- Logs to database
- Returns structured response

### 5. Agents

Currently placeholders (to be implemented in Module 1, Block 2-5):
- `requirement_analyst.py`: Analyzes business ideas
- `qa_agent.py`: Generates test cases
- `code_review_agent.py`: Reviews code
- `solution_architect.py`: Designs solutions
- `implementation_agent.py`: Assists with coding
- `devops_agent.py`: DevOps guidance
- `incident_support_agent.py`: Incident management

### 6. Guardrails

Currently placeholders (to be implemented in Module 2):
- `secrets_checker.py`: Detects API keys, tokens
- `pii_masker.py`: Masks personal data
- `prompt_injection_checker.py`: Blocks injection attempts
- `human_approval.py`: Requires approval for risky actions

### 7. RAG Knowledge Base

Currently placeholder (to be implemented in Module 2):
- Vector database: Qdrant
- Stores organizational policies and standards
- Enables grounded AI responses

### 8. Observability

Currently placeholder (to be implemented in Module 1, Block 6):
- `ai_run_logger.py`: Logs all agent runs
- `db.py`: Database models
- `metrics.py`: Metrics calculation

## Data Flow

### Requirement Analysis Flow

```
User Input
    ↓
Dashboard → API (/analyze-requirement)
    ↓
AI Orchestrator
    ↓
Apply Guardrails
    ├─ Check for secrets
    ├─ Check for PII
    └─ Check for prompt injection
    ↓
Call LLM Client
    ↓
LLM Provider (OpenAI/OpenRouter/Ollama)
    ↓
Parse Response
    ↓
Log to ai_runs table
    ↓
Return to Dashboard
    ↓
Display to User
```

## Database Schema (Phase 1)

### ai_runs table

```sql
CREATE TABLE ai_runs (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMP DEFAULT NOW(),
    stage VARCHAR(50),  -- requirement, qa, code-review, etc
    agent_name VARCHAR(100),
    input_hash VARCHAR(255),
    model VARCHAR(100),
    prompt_template VARCHAR(50),
    latency_ms FLOAT,
    prompt_tokens INT,
    completion_tokens INT,
    total_tokens INT,
    estimated_cost FLOAT,
    output_quality_score FLOAT,
    human_approval_required BOOLEAN,
    human_decision VARCHAR(20),  -- approved, rejected, needs_rework
    risks_detected TEXT,
    error_message TEXT
);
```

## Environment Variables

See `.env.example` for all configuration options.

Key variables:
- `LLM_API_KEY`: API key for LLM provider
- `LLM_MODEL`: Model to use (e.g., openai/gpt-3.5-turbo)
- `DATABASE_URL`: PostgreSQL connection string
- `QDRANT_URL`: Qdrant vector database URL
- `ENABLE_GUARDRAILS`: Toggle guardrails
- `ENABLE_RAG`: Toggle RAG knowledge base

## Security Considerations

- All requests go through guardrails
- Secrets are masked in logs
- PII is masked in responses
- Production changes require human approval
- Audit trail in database
- JSON mode prevents code injection in responses

## Scalability

Current setup (Module 1):
- Single FastAPI instance
- SQLite for development (can upgrade to PostgreSQL)
- In-memory LLM client (can add caching)

Future (Module 2):
- Multiple FastAPI replicas
- PostgreSQL with connection pooling
- Redis for caching
- Metrics aggregation with Prometheus
- Langfuse for advanced observability

## Development

```bash
# Start everything
docker-compose up --build

# Backend logs
docker-compose logs backend

# Frontend logs
docker-compose logs frontend

# API is available at http://localhost:8000
# UI is available at http://localhost:3000
```

## Testing

```bash
# Run backend tests
pytest tests/ -v

# Run specific test
pytest tests/test_main.py::test_health_check -v

# With coverage
pytest tests/ --cov=app
```
