# Careerly

Careerly is an AI-assisted career workspace for managing the full job-search journey—from discovering roles and understanding fit to tracking applications, preparing for interviews, and reaching an offer.

This repository currently contains a responsive React application shell, client-side routing, Supabase email/password authentication, a typed API layer, and a FastAPI service with profile and saved-job APIs. Connecting those APIs to the frontend, application tracking, and AI features are still pending.

## Architecture

```text
careerly/
├── frontend/  React, TypeScript, Vite, Tailwind CSS
└── backend/   FastAPI, Uvicorn, environment-based configuration
```

The frontend uses React Router for public and application routes, TanStack Query for server state, and Axios for HTTP requests. The backend exposes a root endpoint and health check, with CORS configured for local Vite development.

## Local setup

### Frontend

```powershell
cd frontend
Copy-Item .env.example .env.local
npm.cmd install
npm.cmd run dev
```

The frontend runs at `http://localhost:5173` by default.

### Backend

```powershell
cd backend
python -m venv venv
.\venv\Scripts\python.exe -m pip install -r requirements.txt
.\venv\Scripts\uvicorn.exe app.main:app --reload
```

The API runs at `http://127.0.0.1:8000`. Interactive documentation is available at `/docs`.

### Database migrations

Configure `backend/.env` with `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, and `DATABASE_URL`. Use the Supabase Session Pooler connection on port 5432 and URL-encode special characters in the database password. Credentials stay in `.env`; Alembic reads them through the backend settings.

From `backend`, apply migrations and check their status:

```powershell
.\venv\Scripts\python.exe -m alembic upgrade head
.\venv\Scripts\python.exe -m alembic current
```

The initial migration creates `public.profiles`, linked to `auth.users.id`, with name, headline, location, bio, and timestamps. Deleting an Auth user cascades to their profile. Row-level security restricts browser access to the profile owner. The profile API creates a missing profile on first access; signup creates the Supabase identity.

To prepare future schema changes, edit the models, run `python -m alembic revision --autogenerate -m "describe change"` using the backend virtual environment, and review the generated migration before applying it. Autogeneration excludes Supabase-managed and unrelated tables. Policies and other SQL objects require explicit migrations. `updated_at` is maintained on SQLAlchemy updates; direct SQL writes must update it explicitly.

The backend database connection uses privileged credentials. Profile endpoints filter by the authenticated user ID even though browser access is protected by RLS. Future endpoints must enforce the same ownership checks. Never accept a caller-provided user ID as authorization.

## Environment configuration

Copy the relevant `.env.example` file when local overrides are needed. Real environment files and secrets are ignored by Git.

Authentication requires these values in `frontend/.env.local`:

```dotenv
VITE_PUBLIC_APP_URL=http://localhost:5173
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
```

Find both values in the Supabase project **Connect** dialog. Use the publishable key (or legacy anon key), never a service-role or secret key in frontend code. `VITE_PUBLIC_APP_URL` optionally selects a browser-reachable email confirmation destination; it defaults to the current browser origin.

In Supabase Authentication URL settings, allow `<VITE_PUBLIC_APP_URL>/auth/confirmed`. For cross-device testing on the same Wi-Fi, run Vite with `npm.cmd run dev -- --host 0.0.0.0`, set `VITE_PUBLIC_APP_URL` to the computer's LAN address (for example, `http://192.168.1.11:5173`), and allow the matching `/auth/confirmed` URL in Supabase.

## Current routes

Backend user and saved-job endpoints require `Authorization: Bearer <Supabase access token>`:

- `GET /api/v1/users/me` returns the verified Supabase identity.
- `GET /api/v1/users/me/profile` returns the database profile, creating it if needed.
- `PATCH /api/v1/users/me/profile` updates name, headline, location, and bio. Omitted fields are preserved; explicit `null` clears a field. Unknown fields, including user IDs, are rejected. Name/headline/location allow 200 characters each; bio allows 5,000. Profile edits do not change Supabase Auth metadata.

- `POST /api/v1/saved-jobs` saves a manually entered job (201).
- `GET /api/v1/saved-jobs?limit=20&offset=0` lists only the caller's jobs, newest first. The response is an array; limit is 1–100 and offset is nonnegative.
- `GET /api/v1/saved-jobs/{job_id}` reads one owned job.
- `PATCH /api/v1/saved-jobs/{job_id}` updates supplied fields only.
- `DELETE /api/v1/saved-jobs/{job_id}` deletes an owned job (204, no response body).

Saved jobs require a nonblank `title` and `company` (up to 200 characters each). Optional `location` allows 200 characters, `job_url` accepts HTTP/HTTPS URLs up to 2,048 characters, and `description` allows 20,000. Explicit null clears optional fields but cannot clear title/company. Caller-supplied IDs and owner IDs are rejected. Missing jobs and jobs owned by other users both return 404. Duplicate jobs are allowed. Each saved job references `auth.users.id`, and deleting an Auth user cascades to their jobs. RLS enforces ownership for browser database access; backend queries enforce ownership independently.

Example create request body:

```json
{"title": "Backend Developer", "company": "Example", "location": "Remote", "job_url": "https://example.com/jobs/1"}
```

Run backend checks from `backend` with `.\venv\Scripts\python.exe -m unittest discover -s tests -v`. For Supabase integration checks, set `$env:CAREERLY_TEST_DATABASE = "1"` before running. These tests use existing Auth users, override authentication, and roll back all test changes. Two existing Auth users are needed to exercise cross-user isolation; these checks do not test real sign-in tokens.

- Public: `/`, `/login`, `/signup`, `/auth/confirmed`
- Protected: `/app`, `/app/jobs`, `/app/applications`, `/app/resume`, `/app/interview`, `/app/profile`
