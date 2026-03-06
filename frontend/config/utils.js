function normalizeRole(claims) {
    const rolesClaim = claims['urn:zitadel:iam:org:project:roles'];
    if (!rolesClaim) return null;

    // Zitadel actual format: { "Admin": { "<orgId>": "<orgDomain>" }, ... }
    if (typeof rolesClaim === 'object' && !Array.isArray(rolesClaim)) {
        if ('admin' in rolesClaim) return 'Admin';
        if ('staff' in rolesClaim) return 'Staff';
        return null;
    }

    // Fallback: array of strings format
    const roles = Array.isArray(rolesClaim) ? rolesClaim : [rolesClaim];
    let hasAdmin = false;
    let hasStaff = false;
    for (const r of roles) {
        const key = typeof r === 'string' ? r.split(':').pop() : r?.key;
        if (key === 'Admin') hasAdmin = true;
        if (key === 'Staff') hasStaff = true;
    }
    if (hasAdmin) return 'Admin';
    if (hasStaff) return 'Staff';
    return null;
}

export { normalizeRole };