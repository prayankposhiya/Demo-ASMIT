// src/auth/zitadelConfig.js
// ─────────────────────────────────────────────────────────────
// Zitadel OIDC configuration for the React frontend.
// All values come from your .env file.
// ─────────────────────────────────────────────────────────────

export const zitadelConfig = {
    // Your Zitadel domain (e.g. https://my-company.zitadel.cloud)
    authority: "https://demotask-8o6xcx.us1.zitadel.cloud/",

    // Client ID of your Web Application in Zitadel
    client_id: "362715785161881926",

    // Where Zitadel redirects after login — must match exactly in Dashboard
    redirect_uri: "http://localhost:5173/dashboard",

    // Where Zitadel redirects after logout
    post_logout_redirect_uri: "http://localhost:5173/login",

    // Authorization Code flow with PKCE (most secure for SPAs)
    response_type: "code",

    // Scopes:
    //   openid  → required for OIDC
    //   profile → gives name, picture
    //   email   → gives email address
    //   urn:zitadel:iam:org:project:roles → includes user roles in the token
    scope:
        "openid profile email urn:zitadel:iam:org:project:roles",

    // Automatically renew the access token before it expires (silent refresh)
    automaticSilentRenew: true,

    // Fetch user info from Zitadel's /userinfo endpoint after login
    loadUserInfo: true,
};
