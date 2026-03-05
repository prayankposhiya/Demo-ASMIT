import Login from './components/Login'
import { Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute from '../auth/ProtectedRoute'
import Dashboard from './components/Dashboard'
import Users from './components/Users'
import Appointments from './components/Appointments'
import CustomerDetail from './components/CustomerDetail'
import Navbar from './components/Navbar'

function App() {
  return (
    <Routes>
      {/* Zitadel redirects here after login */}
      <Route path="/login" element={<Login />} />

      {/* Redirect root to dashboard */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      {/* ── Protected Routes (login required) ─────────── */}
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <div className="app-layout">
              <Navbar />
              <main className="app-content">
                <Routes>
                  <Route path="/dashboard" element={<Dashboard />} />
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
