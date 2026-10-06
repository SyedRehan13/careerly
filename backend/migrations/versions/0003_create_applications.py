"""Create user-owned application tracking."""
from alembic import op
import sqlalchemy as sa

revision = "0003_create_applications"
down_revision = "0002_create_saved_jobs"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "applications",
        sa.Column("id", sa.Uuid(), server_default=sa.text("gen_random_uuid()"), nullable=False),
        sa.Column("user_id", sa.Uuid(), nullable=False),
        sa.Column("title", sa.String(200), nullable=False),
        sa.Column("company", sa.String(200), nullable=False),
        sa.Column("location", sa.String(200), nullable=True),
        sa.Column("job_url", sa.String(2048), nullable=True),
        sa.Column("status", sa.String(20), server_default="applied", nullable=False),
        sa.Column("applied_date", sa.Date(), nullable=True),
        sa.Column("follow_up_date", sa.Date(), nullable=True),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.CheckConstraint("status IN ('applied', 'interviewing', 'offer', 'rejected', 'withdrawn')", name="valid_status"),
        sa.ForeignKeyConstraint(["user_id"], ["auth.users.id"], name="fk_applications_user_id_users", ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id", name="pk_applications"),
    )
    op.create_index("ix_applications_user_id_created_at", "applications", ["user_id", "created_at"])
    op.execute("ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY")
    op.execute("REVOKE ALL ON public.applications FROM anon, authenticated")
    op.execute("GRANT SELECT, INSERT, UPDATE, DELETE ON public.applications TO authenticated")
    for operation in ("SELECT", "INSERT", "UPDATE", "DELETE"):
        condition = "(SELECT auth.uid()) = user_id"
        clauses = f"WITH CHECK ({condition})" if operation == "INSERT" else f"USING ({condition})"
        if operation == "UPDATE":
            clauses += f" WITH CHECK ({condition})"
        op.execute(
            f"CREATE POLICY applications_owner_{operation.lower()} ON public.applications "
            f"FOR {operation} TO authenticated {clauses}"
        )


def downgrade() -> None:
    op.drop_index("ix_applications_user_id_created_at", table_name="applications")
    op.drop_table("applications")
