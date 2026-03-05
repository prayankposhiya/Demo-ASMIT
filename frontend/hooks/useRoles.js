// src/hooks/useRoles.js
// ─────────────────────────────────────────────────────────────
// Custom hook to read the user's roles from the Zitadel JWT.
//
// Zitadel puts roles inside this specific claim key:
//   "urn:zitadel:iam:org:project:roles": { "admin": {...} }
//
// Usage:
//   const { isAdmin, isUser, hasRole, roles } = useRoles();
// ─────────────────────────────────────────────────────────────

import { useAuth } from "react-oidc-context";

// This is the Zitadel-specific claim key for project roles
const ROLES_CLAIM = "urn:zitadel:iam:org:project:roles";

export function useRoles() {
    const auth = useAuth();

    // Extract roles object from the user's profile (decoded ID token)
    // Shape: { "admin": { "<orgId>": "<orgDomain>" }, "user": {...} }
    const rolesObj = auth.user?.profile?.[ROLES_CLAIM] || {};

    // Convert to a simple array of role name strings: ["admin", "user"]
    const roles = Object.keys(rolesObj);

    return {
        // Array of all role names the user has
        roles,

        // Convenience booleans
        isAdmin: roles.includes("admin"),
        isUser: roles.includes("user"),
        isStaff: roles.includes("staff"),

        // Check any arbitrary role
        hasRole: (role) => roles.includes(role),
    };
}
