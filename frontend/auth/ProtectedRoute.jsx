import { useAuth } from "react-oidc-context";
import { useRoles } from "../src/hooks/useRoles";

export default function ProtectedRoute({ children, requiredRole }) {
    const auth = useAuth();
    const { hasRole } = useRoles();

    if (auth.isLoading) {
        return (
            <div
                style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    height: "100vh",
                    background: "#0d1117",
                }}
            >
                <div
                    style={{
                        width: 32,
                        height: 32,
                        border: "3px solid #334155",
                        borderTop: "3px solid #FF6B35",
                        borderRadius: "50%",
                        animation: "spin 0.8s linear infinite",
                    }}
                />
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    if (!auth.isAuthenticated) {
        auth.signinRedirect();
        return (
            <div
                style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    height: "100vh",
                    color: "#64748b",
                    fontFamily: "system-ui",
                    background: "#0d1117",
                }}
            >
                Redirecting to login...
            </div>
        );
    }

    if (requiredRole && !hasRole(requiredRole)) {
        return (
            <div
                style={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    height: "100vh",
                    gap: 12,
                    fontFamily: "system-ui",
                    background: "#0d1117",
                    color: "#e2e8f0",
                }}
            >
                <span style={{ fontSize: 48 }}>🚫</span>
                <h2 style={{ margin: 0 }}>Access Denied</h2>
                <p style={{ color: "#64748b", margin: 0 }}>
                    You need the <strong>{requiredRole}</strong> role to view this page.
                </p>
            </div>
        );
    }

    return children;
}
