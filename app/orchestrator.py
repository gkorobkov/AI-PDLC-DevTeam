from typing import Any, Dict

from app.agents.requirement_analyst import (
    AnalyzeRequirementRequest,
    RequirementAnalystAgent,
)
from app.llm_client import LLMClient


class AgentOrchestrator:
    """Routes PDLC requests to agents through a single runtime surface."""

    def __init__(self, llm_client: LLMClient):
        self.requirement_analyst = RequirementAnalystAgent(llm_client)

    def analyze_requirement(
        self,
        request: AnalyzeRequirementRequest,
    ) -> Dict[str, Any]:
        return self.requirement_analyst.analyze(request)
