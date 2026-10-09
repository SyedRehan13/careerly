import { Outlet } from 'react-router-dom'
import { Suspense } from 'react'
export function PublicLayout() {
  return (
    <div className="public-layout">
      <Suspense
        fallback={
          <p role="status" className="min-h-screen grid place-items-center text-sm muted">
            Opening Careerly…
          </p>
        }
      >
        <Outlet />
      </Suspense>
    </div>
  )
}
