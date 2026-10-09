"""Create user-owned structured resumes."""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = "0004_create_resumes"
down_revision = "0003_create_applications"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "resumes",
        sa.Column("user_id", sa.Uuid(), nullable=False),
        sa.Column("content", postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["auth.users.id"], name="fk_resumes_user_id_users", ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("user_id", name="pk_resumes"),
    )
    op.execute("ALTER TABLE public.resumes ENABLE ROW LEVEL SECURITY")
    op.execute("REVOKE ALL ON public.resumes FROM anon, authenticated")
    op.execute("GRANT SELECT, INSERT, UPDATE, DELETE ON public.resumes TO authenticated")
    for operation in ("SELECT", "INSERT", "UPDATE", "DELETE"):
        condition = "(SELECT auth.uid()) = user_id"
        clauses = f"WITH CHECK ({condition})" if operation == "INSERT" else f"USING ({condition})"
        if operation == "UPDATE":
            clauses += f" WITH CHECK ({condition})"
        op.execute(
            f"CREATE POLICY resumes_owner_{operation.lower()} ON public.resumes "
            f"FOR {operation} TO authenticated {clauses}"
        )


def downgrade() -> None:
    op.drop_table("resumes")
