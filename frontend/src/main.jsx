import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from "react-oidc-context";
import { BrowserRouter } from "react-router-dom";
import { zitadelConfig } from "../auth/zitadelConfig"

const onSigninCallback = () => {
  window.history.replaceState({}, document.title, window.location.pathname);
};

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider {...zitadelConfig} onSigninCallback={onSigninCallback}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </AuthProvider>
  </StrictMode>,
)
