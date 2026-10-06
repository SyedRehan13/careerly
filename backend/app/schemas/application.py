from datetime import date, datetime
from typing import Literal
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, field_validator

from app.schemas.saved_job import JobUrl

ApplicationStatus = Literal["applied", "interviewing", "offer", "rejected", "withdrawn"]


class ApplicationCreate(BaseModel):
    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)

    title: str = Field(min_length=1, max_length=200)
    company: str = Field(min_length=1, max_length=200)
    location: str | None = Field(default=None, max_length=200)
    job_url: JobUrl | None = None
    status: ApplicationStatus = "applied"
    applied_date: date | None = None
    follow_up_date: date | None = None
    notes: str | None = Field(default=None, max_length=20_000)


class ApplicationUpdate(BaseModel):
    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)

    title: str | None = Field(default=None, min_length=1, max_length=200)
    company: str | None = Field(default=None, min_length=1, max_length=200)
    location: str | None = Field(default=None, max_length=200)
    job_url: JobUrl | None = None
    status: ApplicationStatus | None = None
    applied_date: date | None = None
    follow_up_date: date | None = None
    notes: str | None = Field(default=None, max_length=20_000)

    @field_validator("title", "company", "status")
    @classmethod
    def reject_null_required_fields(cls, value: str | None) -> str:
        if value is None:
            raise ValueError("This field cannot be null.")
        return value


class ApplicationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    user_id: UUID
    title: str
    company: str
    location: str | None
    job_url: str | None
    status: ApplicationStatus
    applied_date: date | None
    follow_up_date: date | None
    notes: str | None
    created_at: datetime
    updated_at: datetime
