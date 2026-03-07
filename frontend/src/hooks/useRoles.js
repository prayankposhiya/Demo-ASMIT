import { useAuth } from "react-oidc-context";

const ROLES_CLAIM = "urn:zitadel:iam:org:project:roles";

export function useRoles() {
    const auth = useAuth();

    const rolesObj = auth.user?.profile?.[ROLES_CLAIM] || {};
    const roles = Object.keys(rolesObj);

    return {
        roles,
        isAdmin: roles.includes("admin"),
        isStaff: roles.includes("staff"),
        hasRole: (role) => roles.includes(role),
    };
}
