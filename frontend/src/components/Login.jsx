import { useState, useEffect } from 'react'
import { useAuth } from "react-oidc-context";
import { useNavigate } from 'react-router-dom';
import './Login.css'

function Login() {
  const auth = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (auth.isAuthenticated) {
      navigate('/appointments');
    }
  }, [auth.isAuthenticated, navigate]);

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    // TODO: integrate with auth API
    console.log('Login attempt:', { email, password, rememberMe })
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-header">
          <div className="login-logo">
            <span className="login-logo-icon">📅</span>
          </div>
          <h1>Appointment CRM</h1>
          <p className="login-subtitle">Sign in for Admin & Staff</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>

          <div className="form-options">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <span>Remember me</span>
            </label>
            <a href="#" className="forgot-link">Forgot password?</a>
          </div>

          <button type="submit" className="login-btn">
            Sign in
          </button>
        </form>

        <div className="login-divider">
          <span>OR</span>
        </div>

        <button
          type="button"
          className="zitadel-login-btn"
          onClick={() => auth.signinRedirect()}
        >
          <img
            src="https://raw.githubusercontent.com/zitadel/zitadel/main/docs/docs/static/img/zitadel-logo-dark.svg"
            alt="Zitadel Logo"
            className="zitadel-icon"
          />
          Login with Zitadel
        </button>

        <p className="login-footer">
          Contact your administrator if you need access.
        </p>
      </div>
    </div>
  )
}

export default Login
