"""Create user-owned saved jobs."""
from alembic import op
import sqlalchemy as sa

revision = "0002_create_saved_jobs"
down_revision = "0001_create_profiles"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "saved_jobs",
        sa.Column("id", sa.Uuid(), server_default=sa.text("gen_random_uuid()"), nullable=False),
        sa.Column("user_id", sa.Uuid(), nullable=False),
        sa.Column("title", sa.String(200), nullable=False),
        sa.Column("company", sa.String(200), nullable=False),
        sa.Column("location", sa.String(200), nullable=True),
        sa.Column("job_url", sa.String(2048), nullable=True),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["auth.users.id"], name="fk_saved_jobs_user_id_users", ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id", name="pk_saved_jobs"),
    )
    op.create_index("ix_saved_jobs_user_id_created_at", "saved_jobs", ["user_id", "created_at"])
    op.execute("ALTER TABLE public.saved_jobs ENABLE ROW LEVEL SECURITY")
    op.execute("REVOKE ALL ON public.saved_jobs FROM anon, authenticated")
    op.execute("GRANT SELECT, INSERT, UPDATE, DELETE ON public.saved_jobs TO authenticated")
    for operation in ("SELECT", "INSERT", "UPDATE", "DELETE"):
        condition = "(SELECT auth.uid()) = user_id"
        clauses = f"WITH CHECK ({condition})" if operation == "INSERT" else f"USING ({condition})"
        if operation == "UPDATE":
            clauses += f" WITH CHECK ({condition})"
        op.execute(
            f"CREATE POLICY saved_jobs_owner_{operation.lower()} ON public.saved_jobs "
            f"FOR {operation} TO authenticated {clauses}"
        )


def downgrade() -> None:
    op.drop_index("ix_saved_jobs_user_id_created_at", table_name="saved_jobs")
    op.drop_table("saved_jobs")
