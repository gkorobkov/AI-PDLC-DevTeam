import logging
from contextlib import asynccontextmanager
from datetime import datetime

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from app.agents.base_agent import AgentExecutionError
from app.agents.requirement_analyst import (
    AnalyzeRequirementRequest,
    AnalyzeRequirementResponse,
)
from app.config import settings
from app.llm_client import LLMClient
from app.orchestrator import AgentOrchestrator

# Configure logging
logging.basicConfig(
    level=settings.log_level,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Initialize LLM client
llm_client = LLMClient(
    api_key=settings.llm_api_key,
    model=settings.llm_model,
    api_base_url=settings.llm_api_base_url,
    provider=settings.llm_provider
)
orchestrator = AgentOrchestrator(llm_client)

# Lifespan events
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info(f"Starting AI PDLC Backend (environment: {settings.environment})")
    logger.info(f"LLM Provider: {settings.llm_provider}, Model: {settings.llm_model}")
    yield
    # Shutdown
    logger.info("Shutting down AI PDLC Backend")

# Create FastAPI app
app = FastAPI(
    title="AI PDLC Development Team",
    description="AI agents for PDLC/SDLC",
    version="0.1.0",
    lifespan=lifespan
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request/Response models
class HealthCheckResponse(BaseModel):
    status: str
    environment: str
    timestamp: str
    services: dict

# Health check endpoint
@app.get("/health", response_model=HealthCheckResponse)
async def health_check():
    """Check system health."""
    return HealthCheckResponse(
        status="healthy",
        environment=settings.environment,
        timestamp=datetime.now().isoformat(),
        services={
            "backend": "operational",
            "database": "configured",
            "llm": settings.llm_provider
        }
    )

# Requirement Analyst endpoint
@app.post("/analyze-requirement", response_model=AnalyzeRequirementResponse)
async def analyze_requirement(request: AnalyzeRequirementRequest):
    """Analyze business requirement and generate structured output."""

    try:
        result = orchestrator.analyze_requirement(request)
        latency_ms = result["metadata"]["latency_ms"]
        logger.info(f"Requirement analyzed in {latency_ms:.0f}ms")

        return AnalyzeRequirementResponse(
            success=True,
            data=result["content"],
            latency_ms=latency_ms,
        )

    except AgentExecutionError as e:
        logger.error(f"Requirement agent failed: {e.message}", extra=e.details)
        raise HTTPException(status_code=e.status_code, detail={
            "error": e.message,
            "details": e.details,
        })
    except Exception as e:
        logger.error(f"Error analyzing requirement: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# Status endpoint
@app.get("/status")
async def status():
    """Get system status."""
    return {
        "service": "AI PDLC Backend",
        "version": "0.1.0",
        "environment": settings.environment,
        "llm_configured": bool(settings.llm_api_key),
        "features": {
            "guardrails": settings.enable_guardrails,
            "rag": settings.enable_rag,
            "metrics": settings.enable_metrics_dashboard
        }
    }

# LLM limits endpoint
@app.get("/llm-limits")
async def llm_limits():
    """Get current LLM API key usage and limit information."""
    response = llm_client.get_key_limits(
        response_mode=settings.llm_limits_response_mode
    )

    if response["success"]:
        return response

    raise HTTPException(
        status_code=502,
        detail=f"LLM limits lookup failed: {response.get('error')}"
    )

# Test endpoint
@app.get("/test-llm")
async def test_llm():
    """Test LLM connectivity."""
    response = llm_client.complete(
        prompt="Say 'Hello from AI PDLC' in exactly 5 words.",
        temperature=0.5,
        max_tokens=50
    )

    if response["success"]:
        return {
            "status": "ok",
            "message": response["content"],
            "model": response["model"],
            "latency_ms": response["latency_ms"]
        }
    else:
        raise HTTPException(
            status_code=500,
            detail=f"LLM test failed: {response.get('error')}"
        )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host=settings.api_host,
        port=settings.api_port,
        reload=settings.debug
    )
