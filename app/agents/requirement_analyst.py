from typing import Any, Dict

from pydantic import BaseModel, Field, field_validator

from app.agents.base_agent import BaseAgent


class AnalyzeRequirementRequest(BaseModel):
    business_idea: str = Field(..., min_length=1)
    product_context: str = ""
    constraints: str = ""

    @field_validator("business_idea")
    @classmethod
    def business_idea_must_not_be_blank(cls, value: str) -> str:
        stripped = value.strip()
        if not stripped:
            raise ValueError("business_idea must not be blank")
        return stripped


class AnalyzeRequirementResponse(BaseModel):
    success: bool
    data: Dict[str, Any] | None = None
    error: str | None = None
    latency_ms: float


class RequirementAnalystAgent(BaseAgent):
    def __init__(self, llm_client):
        super().__init__(
            llm_client=llm_client,
            agent_name="requirement_analyst",
            stage="requirement",
        )

    def analyze(self, request: AnalyzeRequirementRequest) -> Dict[str, Any]:
        system_prompt = self.load_prompt("requirement_analyst_system.txt")
        user_template = self.load_prompt("requirement_analyst_user.txt")
        user_prompt = self.render_prompt(
            user_template,
            business_idea=request.business_idea,
            product_context=request.product_context,
            constraints=request.constraints,
        )

        return self.complete_json(
            prompt=user_prompt,
            system_prompt=system_prompt,
            temperature=0.7,
            max_tokens=2048,
        )
