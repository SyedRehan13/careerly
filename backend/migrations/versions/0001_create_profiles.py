"""Create Careerly profiles linked to Supabase identities."""
from alembic import op
import sqlalchemy as sa

revision = "0001_create_profiles"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "profiles",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("full_name", sa.String(200), nullable=True),
        sa.Column("headline", sa.String(200), nullable=True),
        sa.Column("location", sa.String(200), nullable=True),
        sa.Column("bio", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(["id"], ["auth.users.id"], name="fk_profiles_id_users", ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id", name="pk_profiles"),
    )
    op.execute("ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY")
    op.execute("REVOKE ALL ON public.profiles FROM anon, authenticated")
    op.execute("GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated")
    for operation in ("SELECT", "INSERT", "UPDATE", "DELETE"):
        condition = "(SELECT auth.uid()) = id"
        clauses = f"WITH CHECK ({condition})" if operation == "INSERT" else f"USING ({condition})"
        if operation == "UPDATE":
            clauses += f" WITH CHECK ({condition})"
        op.execute(
            f"CREATE POLICY profiles_owner_{operation.lower()} ON public.profiles "
            f"FOR {operation} TO authenticated {clauses}"
        )
    # Migration history is not a browser-facing API resource.
    op.execute("ALTER TABLE public.alembic_version ENABLE ROW LEVEL SECURITY")
    op.execute("REVOKE ALL ON public.alembic_version FROM anon, authenticated")


def downgrade() -> None:
    op.drop_table("profiles")
