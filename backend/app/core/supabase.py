from functools import lru_cache

from supabase import Client, create_client

from app.core.config import settings


@lru_cache
def get_supabase_client() -> Client:
    if settings.supabase_url is None or settings.supabase_publishable_key is None:
        raise RuntimeError(
            "SUPABASE_URL and SUPABASE_PUBLISHABLE_KEY are required for authentication."
        )

    return create_client(
        settings.supabase_url,
        settings.supabase_publishable_key.get_secret_value(),
    )
