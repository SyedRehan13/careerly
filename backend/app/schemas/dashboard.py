from datetime import date

from pydantic import BaseModel, Field

from app.schemas.application import ApplicationResponse


class ApplicationStatusCounts(BaseModel):
    applied: int = Field(default=0, ge=0)
    interviewing: int = Field(default=0, ge=0)
    offer: int = Field(default=0, ge=0)
    rejected: int = Field(default=0, ge=0)
    withdrawn: int = Field(default=0, ge=0)


class DashboardSummary(BaseModel):
    as_of_date: date
    saved_jobs_count: int = Field(ge=0)
    total_applications: int = Field(ge=0)
    active_applications: int = Field(ge=0)
    applications_by_status: ApplicationStatusCounts
    recent_applications: list[ApplicationResponse]
    upcoming_follow_ups: list[ApplicationResponse]
