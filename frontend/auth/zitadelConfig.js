export const zitadelConfig = {
    authority: import.meta.env.VITE_ZITADEL_AUTHORITY,
    client_id: import.meta.env.VITE_ZITADEL_CLIENT_ID,
    redirect_uri: import.meta.env.VITE_ZITADEL_REDIRECT_URI,
    post_logout_redirect_uri: import.meta.env.VITE_ZITADEL_POST_LOGOUT_REDIRECT_URI,
    response_type: "code",
    scope: "openid profile email urn:zitadel:iam:org:project:roles",
    automaticSilentRenew: true,
    loadUserInfo: true,
};
