from typing import List, Optional
from pydantic import BaseModel, Field, field_validator


class AnalyzeRequest(BaseModel):
    name: str = Field(default="", max_length=120)
    audience: str = Field(default="", max_length=300)
    problem: str = Field(max_length=3000)
    value_proposition: str = Field(max_length=4000)
    features: List[str] = Field(default_factory=list, max_length=30)

    @field_validator("name", "audience", "problem", "value_proposition")
    @classmethod
    def _strip(cls, v: str) -> str:
        return v.strip()

    @field_validator("features")
    @classmethod
    def _clean_features(cls, v: List[str]) -> List[str]:
        return [x.strip() for x in v if x and x.strip()]


class ApiError(BaseModel):
    code: str
    message: str
    hint: Optional[str] = None
