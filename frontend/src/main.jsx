import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from "react-oidc-context";
import { NotificationProvider } from "./context/NotificationContext";
import { BrowserRouter } from "react-router-dom";
import { zitadelConfig } from "../auth/zitadelConfig"

const onSigninCallback = () => {
  window.history.replaceState({}, document.title, window.location.pathname);
};

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <NotificationProvider>
      <AuthProvider {...zitadelConfig} onSigninCallback={onSigninCallback}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </AuthProvider>
    </NotificationProvider>
  </StrictMode>,
)
