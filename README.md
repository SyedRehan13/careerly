# Careerly

Careerly is an AI-assisted career workspace for managing the full job-search journey—from discovering roles and understanding fit to tracking applications, preparing for interviews, and reaching an offer.

This repository currently contains a responsive React application shell, client-side routing, Supabase authentication, profile, resume, saved-job, application, and dashboard pages connected to FastAPI. Resume content is account-scoped and can be exported through the browser's print-to-PDF flow. AI features are still pending.

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

The profile page at `/app/profile` loads career details from the backend and saves name, headline, location, and bio. Run both frontend and backend for this page to work, and point `VITE_API_BASE_URL` at your API if it is not `http://127.0.0.1:8000`. Requests send the current Supabase bearer token; the backend validates it. Profile query caches are keyed by user ID and discarded when the page unmounts. A session change prevents a form from saving to another user's account.

To verify profile integration, log in, open `/app/profile`, edit a field, save, and reload to confirm it persists. Clear a field and save to check that it stays empty. Stop the backend to check the loading error and retry action. Log out and switch accounts to confirm each account sees its own details. Profile edits currently update the career profile only; account email and Supabase Auth metadata remain separate.

The resume workspace at `/app/resume` saves contact details, summary, skills, experience, and education to the signed-in user's account. It also accepts one private PDF, DOC, or DOCX CV up to 10 MB per account; CV parsing and job matching are not implemented yet. The live preview updates as you edit; **Export PDF** opens the browser print dialog, where you can save the resume as a PDF. Apply database migrations before using the workspace. To verify it, fill in a few sections, save, reload, upload a CV, and export the preview. Switch accounts to confirm resumes and CV files are isolated.

The saved-jobs page at `/app/jobs` loads real saved jobs with 20 entries per page. Use **Save a job** to enter a title and company, plus optional location, HTTP/HTTPS job link, and description. Jobs can be edited or deleted with confirmation. Blank optional fields are saved as null. Lists refresh after successful saves and deletions; requests validate the current session and caches are scoped by user ID. Loading, empty, retry, validation, and save/delete error states are included. Jobs are entered manually; automated discovery is not implemented.

To verify saved jobs with both servers running, save a job, reload, edit its details, and reload again. Cancel a deletion first, then confirm it and check that the job disappears. Stop the backend to check error/retry behavior and retained form input. Switch accounts to confirm isolation.

The dashboard loads the authenticated user's real summary: active applications, interviewing applications, saved jobs, offers, all five status counts, five recent applications, and up to five upcoming follow-ups. It uses the browser's local calendar date, checked every minute and on focus. Saved-job and application changes invalidate that user's dashboard cache. No sample records, fabricated trends, or scheduled interviews are shown.

To verify the dashboard with both servers running, check zero counts and empty lists on a new account. Save a job and add an application with an upcoming follow-up date, then return to the dashboard and check the counts and lists. Change the application status and verify its count moves. Stop the backend and refresh to check the error state (previously loaded data is explicitly marked). Switch accounts to confirm each sees only its own summary.

The applications page at `/app/applications` supports manual application entry, editing, deletion with confirmation, all five status filters, and 20 entries per page. Applied and follow-up dates stay calendar dates; blank dates and optional fields are saved as null. Successful changes refresh the user's application queries and invalidate their dashboard queries. Changes that move an application out of the current status filter switch to its new status so the result remains accessible.

To verify applications, add a role with dates and notes, refresh, edit its status to Interviewing, and filter by that status. Clear a date and save to confirm it stays empty. Cancel and then confirm deletion. Stop the backend to verify that failed saves retain input, and switch accounts to verify isolation. Follow-up dates are stored for tracking; automatic notifications are not implemented.

Frontend checks: `npm.cmd run build`, `npm.cmd run lint`, and `node --experimental-strip-types --test tests/career-inputs.test.mjs` (Node 22.6+). The checks cover safe outbound links, supported application statuses, and calendar dates across time zones; browser workflow verification still requires both servers and a signed-in account.

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

The migrations create `public.profiles`, saved jobs, applications, and `public.resumes`, all linked to Supabase Auth users. They also create a private `careerly-cvs` Supabase Storage bucket, limited to 10 MB PDF, DOC, and DOCX files, with policies scoped to each user's folder. Deleting an Auth user cascades to their database records; CV objects are private and only accessible to their owner. The profile API creates a missing profile on first access; the resume API returns an empty draft until the user saves one.

To prepare future schema changes, edit the models, run `python -m alembic revision --autogenerate -m "describe change"` using the backend virtual environment, and review the generated migration before applying it. Autogeneration excludes Supabase-managed and unrelated tables. Policies and other SQL objects require explicit migrations. `updated_at` is maintained on SQLAlchemy updates; direct SQL writes must update it explicitly.

The backend database connection uses privileged credentials. Profile endpoints filter by the authenticated user ID even though browser access is protected by RLS. Future endpoints must enforce the same ownership checks. Never accept a caller-provided user ID as authorization.

## Environment configuration

Copy the relevant `.env.example` file when local overrides are needed. Real environment files and secrets are ignored by Git.

Authentication requires these values in `frontend/.env.local`:

```dotenv
VITE_PUBLIC_APP_URL=http://localhost:5173
VITE_GOOGLE_CLIENT_ID=your-google-oauth-client-id.apps.googleusercontent.com
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
```

Find both values in the Supabase project **Connect** dialog. Use the publishable key (or legacy anon key), never a service-role or secret key in frontend code. `VITE_PUBLIC_APP_URL` optionally selects a browser-reachable email confirmation destination; it defaults to the current browser origin.

`VITE_GOOGLE_CLIENT_ID` is required for the Google sign-in button. Add the app's origin (for example, `http://localhost:5173`, plus any LAN or production origin) to the Google OAuth client's **Authorized JavaScript origins**. Keep the Google provider enabled in Supabase and configure it with the same Client ID and its Client Secret; the secret must stay only in Supabase and must never be added to frontend code or environment files. In Supabase Authentication URL settings, continue allowing `<VITE_PUBLIC_APP_URL>/auth/confirmed` and `<VITE_PUBLIC_APP_URL>/auth/callback`. For cross-device testing on the same Wi-Fi, run Vite with `npm.cmd run dev -- --host 0.0.0.0`, set `VITE_PUBLIC_APP_URL` to the computer's LAN address (for example, `http://192.168.1.11:5173`), and allow the matching confirmation and callback URLs in Supabase.

## Current routes

Backend user, saved-job, and application endpoints require `Authorization: Bearer <Supabase access token>`:

- `GET /api/v1/users/me` returns the verified Supabase identity.
- `GET /api/v1/users/me/profile` returns the database profile, creating it if needed.
- `PATCH /api/v1/users/me/profile` updates name, headline, location, and bio. Omitted fields are preserved; explicit `null` clears a field. Unknown fields, including user IDs, are rejected. Name/headline/location allow 200 characters each; bio allows 5,000. Profile edits do not change Supabase Auth metadata.
- `GET /api/v1/users/me/resume` reads the caller's resume, returning an empty draft when one has not been saved.
- `PUT /api/v1/users/me/resume` saves the caller's contact details, summary, skills, experience, and education. Resume fields and list sizes are validated, and the table has owner-only RLS policies.

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

Application tracking uses `POST` and `GET /api/v1/applications`, and `GET`, `PATCH`, and `DELETE /api/v1/applications/{application_id}`. Lists accept `limit` (1–100), `offset`, and an optional `status` filter, and return an array ordered newest first. Each operation enforces ownership; another user's application returns 404.

Applications are entered manually and require `title` and `company`. Optional fields are `location`, `job_url`, `applied_date`, `follow_up_date`, and `notes` (20,000 characters). Dates use `YYYY-MM-DD`. Status defaults to `applied`; supported values are `applied`, `interviewing`, `offer`, `rejected`, and `withdrawn`, enforced by both the API and a database constraint. Partial updates preserve omitted fields; explicit null clears optional fields. Title, company, and status cannot be null. Current status can be corrected freely; status history, reminders, and automatic conversion from saved jobs are not implemented yet.

`GET /api/v1/dashboard/summary` requires the same bearer authentication and returns only the caller's data: `saved_jobs_count`, `total_applications`, `active_applications`, all five `applications_by_status` counts, `recent_applications`, `upcoming_follow_ups`, and `as_of_date`. Active applications are applied/interviewing/offer. Recent entries sort by creation time, newest first; follow-ups sort by date, soonest first, and include today and later dates only for active applications. Both lists use a deterministic ID tie-breaker. Users without data receive zero counts and empty arrays.

Optional query parameters are `recent_limit` and `follow_up_limit` (each defaults to 5, range 1–20), and `as_of_date=YYYY-MM-DD` (defaults to UTC today). The frontend can supply the user's local date. The summary reads existing tables and does not create data. Counts cover all records, independent of list limits. Interview schedules, response rates, and reminders are not included because their underlying data is not tracked yet.

- Public: `/`, `/login`, `/signup`, `/auth/confirmed`, `/auth/callback`
- Protected: `/app`, `/app/jobs`, `/app/applications`, `/app/resume`, `/app/interview`, `/app/profile`
