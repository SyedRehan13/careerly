# Careerly

Careerly is an AI-assisted career workspace for managing the full job-search journey—from discovering roles and understanding fit to tracking applications, preparing for interviews, and reaching an offer.

This repository currently contains a responsive React application shell, client-side routing, Supabase email/password authentication, a typed API layer, and a small FastAPI service. Database persistence beyond authentication and AI features are intentionally deferred.

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

- Public: `/`, `/login`, `/signup`, `/auth/confirmed`
- Protected: `/app`, `/app/jobs`, `/app/applications`, `/app/resume`, `/app/interview`, `/app/profile`
