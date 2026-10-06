from datetime import datetime
from typing import Annotated
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, HttpUrl, UrlConstraints, field_validator

JobUrl = Annotated[HttpUrl, UrlConstraints(max_length=2048)]


class SavedJobCreate(BaseModel):
    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)

    title: str = Field(min_length=1, max_length=200)
    company: str = Field(min_length=1, max_length=200)
    location: str | None = Field(default=None, max_length=200)
    job_url: JobUrl | None = None
    description: str | None = Field(default=None, max_length=20_000)


class SavedJobUpdate(BaseModel):
    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)

    title: str | None = Field(default=None, min_length=1, max_length=200)
    company: str | None = Field(default=None, min_length=1, max_length=200)
    location: str | None = Field(default=None, max_length=200)
    job_url: JobUrl | None = None
    description: str | None = Field(default=None, max_length=20_000)

    @field_validator("title", "company")
    @classmethod
    def reject_null_required_fields(cls, value: str | None) -> str:
        if value is None:
            raise ValueError("This field cannot be null.")
        return value


class SavedJobResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    user_id: UUID
    title: str
    company: str
    location: str | None
    job_url: str | None
    description: str | None
    created_at: datetime
    updated_at: datetime
