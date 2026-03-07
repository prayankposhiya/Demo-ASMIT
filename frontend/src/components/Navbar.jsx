import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from 'react-oidc-context';
import './Navbar.css';

const Navbar = () => {
    const auth = useAuth();

    return (
        <nav className="navbar">
            <div className="navbar-container">
                <NavLink to="/appointments" className="navbar-logo">
                    <span className="logo-icon">📅</span>
                    <span className="logo-text">CRM</span>
                </NavLink>

                <div className="navbar-links">
                    <NavLink to="/users" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
                        Users
                    </NavLink>
                    <NavLink to="/appointments" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
                        Appointments
                    </NavLink>
                </div>

                <div className="navbar-user">
                    <div className="user-info">
                        <span className="user-name">{auth.user?.profile?.preferred_username || auth.user?.profile?.name}</span>
                        <span className="user-role">{auth.user?.profile?.['urn:zitadel:iam:org:project:roles'] ? Object.keys(auth.user.profile['urn:zitadel:iam:org:project:roles'])[0] : 'User'}</span>
                    </div>
                    <button onClick={() => auth.signoutRedirect()} className="logout-button">
                        Logout
                    </button>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
