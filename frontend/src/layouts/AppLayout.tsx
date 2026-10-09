import { Suspense, useCallback, useEffect, useRef, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { AppHeader } from '../components/layout/AppHeader'
import { Sidebar } from '../components/layout/Sidebar'
import { StatusIndicator } from '../components/common/StatusIndicator'
import { LoadingState } from '../components/common/WorkspaceUI'

export function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const closeSidebar = useCallback(() => setSidebarOpen(false), [])
  const { pathname } = useLocation()
  const mainRef = useRef<HTMLElement>(null)
  useEffect(() => {
    window.scrollTo(0, 0)
    mainRef.current?.focus({ preventScroll: true })
  }, [pathname])
  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <Sidebar open={sidebarOpen} onClose={closeSidebar} />
      <div className="app-body">
        <AppHeader onMenuClick={() => setSidebarOpen(true)} />
        <main id="main-content" className="app-main" ref={mainRef} tabIndex={-1}>
          <Suspense fallback={<LoadingState />}>
            <Outlet />
          </Suspense>
        </main>
        <footer className="app-footer">
          <span>Your next chapter, in progress.</span>
          <StatusIndicator />
        </footer>
      </div>
    </div>
  )
}
