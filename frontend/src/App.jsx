import Login from './components/Login'
import { Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute from '../auth/ProtectedRoute'
import Users from './components/Users'
import Appointments from './components/Appointments'
import CustomerDetail from './components/CustomerDetail'
import Navbar from './components/Navbar'

import { useAuth } from 'react-oidc-context'
import { useEffect } from 'react'
import { injectTokenSource, injectUnauthorizedHandler } from './api/api'

function App() {
  const auth = useAuth()

  useEffect(() => {
    injectTokenSource(() => auth.user?.id_token)
    injectUnauthorizedHandler(() => {
      // Clear OIDC storage and redirect to login
      auth.signinRedirect()
    })
  }, [auth])

  return (
    <Routes>
      {/* Zitadel redirects here after login */}
      <Route path="/login" element={<Login />} />

      {/* Redirect root to appointments */}
      <Route path="/" element={<Navigate to="/appointments" replace />} />

      {/* ── Protected Routes (login required) ─────────── */}
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <div className="app-layout">
              <Navbar />
              <main className="app-content">
                <Routes>
                  <Route path="/users" element={<Users />} />
                  <Route path="/appointments" element={<Appointments />} />
                  <Route path="/customers/:id" element={<CustomerDetail />} />
                </Routes>
              </main>
            </div>
          </ProtectedRoute>
        }
      />
    </Routes>
  )
}

export default App
