"""Add a private Supabase Storage bucket for user CVs."""
from alembic import op

revision = "0005_resume_cv_storage"
down_revision = "0004_create_resumes"
branch_labels = None
depends_on = None

def upgrade() -> None:
    op.execute(
        """
        INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
        VALUES (
            'careerly-cvs',
            'careerly-cvs',
            FALSE,
            10485760,
            ARRAY[
                'application/pdf',
                'application/msword',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
            ]::text[]
        )
        ON CONFLICT (id) DO UPDATE SET
            public = FALSE,
            file_size_limit = EXCLUDED.file_size_limit,
            allowed_mime_types = EXCLUDED.allowed_mime_types
        """
    )
    for operation in ("SELECT", "INSERT", "UPDATE", "DELETE"):
        condition = (
            "bucket_id = 'careerly-cvs' AND "
            "(storage.foldername(name))[1] = (SELECT auth.uid()::text)"
        )
        if operation == "INSERT":
            clauses = f"WITH CHECK ({condition})"
        elif operation == "UPDATE":
            clauses = f"USING ({condition}) WITH CHECK ({condition})"
        else:
            clauses = f"USING ({condition})"
        op.execute(
            f"CREATE POLICY careerly_cvs_owner_{operation.lower()} ON storage.objects "
            f"FOR {operation} TO authenticated {clauses}"
        )


def downgrade() -> None:
    op.execute(
        """
        DO $$ BEGIN
            IF EXISTS (SELECT 1 FROM storage.objects WHERE bucket_id = 'careerly-cvs') THEN
                RAISE EXCEPTION 'Remove stored CV files before downgrading the CV storage migration.';
            END IF;
        END $$
        """
    )
    for operation in ("SELECT", "INSERT", "UPDATE", "DELETE"):
        op.execute(f"DROP POLICY careerly_cvs_owner_{operation.lower()} ON storage.objects")
    op.execute("DELETE FROM storage.buckets WHERE id = 'careerly-cvs'")
