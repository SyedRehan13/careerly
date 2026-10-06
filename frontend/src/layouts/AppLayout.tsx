import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { AppHeader } from '../components/layout/AppHeader'
import { Sidebar } from '../components/layout/Sidebar'

export function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="lg:pl-72">
        <AppHeader onMenuClick={() => setSidebarOpen(true)} />
        <main className="mx-auto max-w-[1440px] p-4 sm:p-6 lg:p-8"><Outlet /></main>
      </div>
    </div>
  )
}
