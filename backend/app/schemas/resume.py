from datetime import datetime
from typing import Annotated
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field

ResumeText = Annotated[str, Field(max_length=20_000)]
ResumeSkill = Annotated[str, Field(min_length=1, max_length=80)]


class ResumeExperience(BaseModel):
    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)

    id: str = Field(min_length=1, max_length=64)
    role: str = Field(default="", max_length=200)
    company: str = Field(default="", max_length=200)
    location: str = Field(default="", max_length=200)
    start_date: str = Field(default="", max_length=40)
    end_date: str = Field(default="", max_length=40)
    description: ResumeText = ""


class ResumeEducation(BaseModel):
    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)

    id: str = Field(min_length=1, max_length=64)
    institution: str = Field(default="", max_length=200)
    qualification: str = Field(default="", max_length=200)
    field_of_study: str = Field(default="", max_length=200)
    start_date: str = Field(default="", max_length=40)
    end_date: str = Field(default="", max_length=40)
    description: ResumeText = ""


class ResumeContent(BaseModel):
    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)

    full_name: str = Field(default="", max_length=200)
    email: str = Field(default="", max_length=320)
    phone: str = Field(default="", max_length=80)
    location: str = Field(default="", max_length=200)
    website: str = Field(default="", max_length=2_048)
    linkedin: str = Field(default="", max_length=2_048)
    summary: ResumeText = ""
    skills: list[ResumeSkill] = Field(default_factory=list, max_length=40)
    experience: list[ResumeExperience] = Field(default_factory=list, max_length=20)
    education: list[ResumeEducation] = Field(default_factory=list, max_length=20)


class ResumeUpdate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    content: ResumeContent


class ResumeResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    user_id: UUID
    content: ResumeContent
    updated_at: datetime | None
