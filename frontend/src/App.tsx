import { lazy, Suspense, useEffect } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'

import { AppLayout } from './layouts/AppLayout'
import { PublicLayout } from './layouts/PublicLayout'
import { GuestRoute } from './routes/GuestRoute'
import { ProtectedRoute } from './routes/ProtectedRoute'

const ApplicationsPage = lazy(() =>
  import('./pages/ApplicationsPage').then((module) => ({ default: module.ApplicationsPage })),
)
const DashboardPage = lazy(() =>
  import('./pages/DashboardPage').then((module) => ({ default: module.DashboardPage })),
)
const EmailConfirmedPage = lazy(() =>
  import('./pages/EmailConfirmedPage').then((module) => ({ default: module.EmailConfirmedPage })),
)
const InterviewPage = lazy(() =>
  import('./pages/InterviewPage').then((module) => ({ default: module.InterviewPage })),
)
const JobsPage = lazy(() =>
  import('./pages/JobsPage').then((module) => ({ default: module.JobsPage })),
)
const LandingPage = lazy(() =>
  import('./pages/LandingPage').then((module) => ({ default: module.LandingPage })),
)
const LoginPage = lazy(() =>
  import('./pages/LoginPage').then((module) => ({ default: module.LoginPage })),
)
const ProfilePage = lazy(() =>
  import('./pages/ProfilePage').then((module) => ({ default: module.ProfilePage })),
)
const ResumePage = lazy(() =>
  import('./pages/ResumePage').then((module) => ({ default: module.ResumePage })),
)
const SignupPage = lazy(() =>
  import('./pages/SignupPage').then((module) => ({ default: module.SignupPage })),
)

const NotFoundPage = lazy(() =>
  import('./pages/NotFoundPage').then((module) => ({ default: module.NotFoundPage })),
)

export default function App() {
  const { pathname } = useLocation()
  useEffect(() => {
    const titles: Record<string, string> = {
      '/': 'Your next chapter',
      '/login': 'Log in',
      '/signup': 'Create account',
      '/auth/confirmed': 'Email confirmation',
      '/app': 'Overview',
      '/app/jobs': 'Saved jobs',
      '/app/applications': 'Applications',
      '/app/resume': 'Resume',
      '/app/interview': 'Interview preparation',
      '/app/profile': 'Your profile',
    }
    document.title = `${titles[pathname] ?? 'Page not found'} · Careerly`
  }, [pathname])
  return (
    <Suspense
      fallback={
        <div className="grid min-h-screen place-items-center bg-[var(--canvas)]">
          <p role="status" className="text-sm muted">
            Opening your next chapter…
          </p>
        </div>
      }
    >
      <Routes>
        <Route element={<PublicLayout />}>
          <Route index element={<LandingPage />} />
          <Route path="auth/confirmed" element={<EmailConfirmedPage />} />
          <Route element={<GuestRoute />}>
            <Route path="login" element={<LoginPage />} />
            <Route path="signup" element={<SignupPage />} />
          </Route>
        </Route>
        <Route element={<ProtectedRoute />}>
          <Route path="app" element={<AppLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="jobs" element={<JobsPage />} />
            <Route path="applications" element={<ApplicationsPage />} />
            <Route path="resume" element={<ResumePage />} />
            <Route path="interview" element={<InterviewPage />} />
            <Route path="profile" element={<ProfilePage />} />
          </Route>
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  )
}
