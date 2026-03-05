import React from 'react';
import { useAuth } from "react-oidc-context";

const Dashboard = () => {
    const auth = useAuth();
    console.log(auth, "authhhh");
    return (
        <div style={{ padding: '2rem', fontFamily: 'system-ui' }}>
            <h1>Dashboard</h1>
            <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <h2>Welcome, {auth.user?.profile?.preferred_username || auth.user?.profile?.name}!</h2>
                <p>You have successfully logged in with Zitadel.</p>
                <div style={{ marginTop: '1rem' }}>
                    <strong>Your Profile Details:</strong>
                    <pre style={{ background: '#0f172a', color: '#f8fafc', padding: '1rem', borderRadius: '4px', overflow: 'auto' }}>
                        {JSON.stringify(auth.user?.profile, null, 2)}
                    </pre>
                </div>
                <button
                    onClick={() => auth.signoutRedirect()}
                    style={{
                        marginTop: '1.5rem',
                        padding: '0.5rem 1rem',
                        background: '#ef4444',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                >
                    Log out
                </button>
            </div>
        </div>
    );
};

export default Dashboard;
