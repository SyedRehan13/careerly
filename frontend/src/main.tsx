import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'

import App from './App'
import { PageErrorBoundary } from './components/common/PageErrorBoundary'
import { AuthProvider } from './context/AuthProvider'
import './index.css'

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID?.trim()

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { refetchOnWindowFocus: false, retry: 1, staleTime: 30_000 },
  },
})

const careerlyApp = (
  <AuthProvider>
    <BrowserRouter>
      <PageErrorBoundary>
        <App />
      </PageErrorBoundary>
    </BrowserRouter>
  </AuthProvider>
)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      {googleClientId ? (
        <GoogleOAuthProvider clientId={googleClientId}>
          {careerlyApp}
        </GoogleOAuthProvider>
      ) : careerlyApp}
    </QueryClientProvider>
  </StrictMode>,
)
