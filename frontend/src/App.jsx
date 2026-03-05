import Login from './components/Login'
import { Routes, Route } from 'react-router-dom'
import ProtectedRoute from '../auth/ProtectedRoute'
import Dashboard from './components/Dashboard'

function App() {
  return (<Routes>

    {/* Zitadel redirects here after login */}
    <Route path="/login" element={<Login />} />

    {/* ── Protected Routes (login required) ─────────── */}
    <Route
      path="/dashboard"
      element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      }
    />
  </Routes>)
}

export default App
