# 🔐 ZITADEL Setup Guide — CRM Backend

> **Purpose:** Every time you need to set up a new Zitadel instance for this CRM project  
> (new developer, new environment, new machine), follow this guide step by step.  
> Nothing is skipped — every small detail is documented.

---

## 📋 Table of Contents

1. [What is Zitadel and why we use it](#1-what-is-zitadel-and-why-we-use-it)
2. [Prerequisites](#2-prerequisites)
3. [Create a Zitadel Cloud Account](#3-create-a-zitadel-cloud-account)
4. [Create a Zitadel Instance](#4-create-a-zitadel-instance)
5. [Open the Management Console](#5-open-the-management-console)
6. [Create the CRM Project](#6-create-the-crm-project)
7. [Enable Role Assertions (CRITICAL)](#7-enable-role-assertions-critical)
8. [Add Roles to the Project](#8-add-roles-to-the-project)
9. [Create the Backend API Application](#9-create-the-backend-api-application)
10. [Create the Frontend Web Application](#10-create-the-frontend-web-application)
11. [Create Test Users](#11-create-test-users)
12. [Assign Roles to Users](#12-assign-roles-to-users)
13. [Configure the Backend `.env` File](#13-configure-the-backend-env-file)
14. [Initialize the Database](#14-initialize-the-database)
15. [Verify with Postman](#15-verify-with-postman)
16. [Common Errors & Fixes](#16-common-errors--fixes)
17. [How JWT Auth Works in This Project](#17-how-jwt-auth-works-in-this-project)
18. [Key Concepts Explained](#18-key-concepts-explained)

---

## 1. What is Zitadel and Why We Use It

**Zitadel** is an open-source Identity Provider (IdP). It handles:
- User login (hosted login page)
- JWT token issuance (Access Tokens, ID Tokens)
- Role management (Admin / Staff)
- OIDC (OpenID Connect) standard

**Why we use it:**
- The CRM task requires ZITADEL Hosted Login with Authorization Code Flow
- Backend validates JWT tokens issued by Zitadel (signature, issuer, audience)
- Roles (Admin/Staff) come FROM the JWT — no hardcoding in the backend

**Flow summary:**
```
React Frontend → redirects user to Zitadel Login page
Zitadel → user logs in, returns Auth Code to frontend
Frontend → exchanges Auth Code for Access Token
Frontend → sends Access Token in every API request header
Express Backend → validates JWT signature using Zitadel's public JWKS keys
Backend → reads role from JWT claims → allows/denies access
```

---

## 2. Prerequisites

- A Google account (or email) to sign up on zitadel.com
- Node.js 18+ installed
- MySQL running locally (or a remote MySQL)
- Postman installed (for testing)
- `npm install` already run in this project

---

## 3. Create a Zitadel Cloud Account

1. Go to **https://zitadel.com**
2. Click **"Sign Up"** (top right)
3. Sign up with Google or your email (`ay.opash@gmail.com` for this project)
4. Complete email verification if prompted
5. You will land on the **Customer Portal** at `https://zitadel.com/admin/instances`

> **Tip:** Use the same Google account each time to avoid creating duplicate organizations.

---

## 4. Create a Zitadel Instance

An **Instance** is a fully isolated environment with its own users, roles, and keys.

1. On the Customer Portal dashboard (`https://zitadel.com/admin/instances`), click **"Create Instance"** or **"New Instance"**
2. Fill in:
   - **Instance Name:** `CRM-Dev` (or `CRM-Prod` for production)
   - **Region:** Select the closest to your users (e.g., `us1` for US)
   - **Plan:** Free is fine for development
3. Click **"Create"**
4. Wait ~10–30 seconds for the instance to be provisioned
5. Your instance domain will look like: `crm-dev-xxxxxxxx.us1.zitadel.cloud`

> **Note this domain — it is your Issuer URL.** You will need it for `.env`.

---

## 5. Open the Management Console

The **Management Console** is where you configure everything (projects, apps, roles, users).

1. On the Customer Portal, find your instance
2. Click **"Open Console"** or **"Manage"** button next to your instance
3. A new tab opens at: `https://<your-instance>.zitadel.cloud/ui/console/`
4. You are now in the Management Console

> **Bookmark this URL.** This is your main admin dashboard.

---

## 6. Create the CRM Project

A **Project** groups your applications (frontend + backend) under one set of roles and authorizations.

1. In the Management Console, click **"Projects"** in the top navigation
2. Click the **"+"** button (or "New Project")
3. Enter:
   - **Name:** `CRM`
4. Click **"Save"** or **"Continue"**
5. You are now inside the CRM project page
6. **COPY THE PROJECT ID** — visible on the project page (e.g., `362714480683006278`)
   - This is used as the `ZITADEL_AUDIENCE` in your `.env`
   - Also appears in the URL: `.../projects/362714480683006278/...`

---

## 7. Enable Role Assertions (CRITICAL ⚠️)

> **This is the most commonly missed step.** Without this, roles NEVER appear in the JWT token.

1. Inside the **CRM project**, click the **"General"** tab in the left sidebar
2. Scroll down to find the **"Assertion"** section
3. Turn ON: **"Assert Roles on Authentication"**
   - This adds the `urn:zitadel:iam:org:project:roles` claim to the JWT
4. Turn ON: **"Check assertion of Roles on Authentication"**
   - This enforces that users must have a role assigned
5. Click **"Save"**

> If you skip this step, your backend will receive JWTs with no role claim, and all users will get `role: null` → 403 Forbidden on all protected routes.

---

## 8. Add Roles to the Project

**Roles** define what permissions a user has. This project uses `Admin` and `Staff`.

1. Inside the CRM project, click **"Roles"** in the left sidebar
2. Click **"+ New"** button

**Role 1:**
| Field | Value |
|-------|-------|
| Key | `Admin` |
| Display Name | `Admin` |
| Group | `crm` |

Click **"Save"**

3. Click **"+ New"** again

**Role 2:**
| Field | Value |
|-------|-------|
| Key | `Staff` |
| Display Name | `Staff` |
| Group | `crm` |

Click **"Save"**

4. You should now see **2 roles** listed: Admin, Staff

> **Key names are case-sensitive.** The backend code checks for exactly `Admin` and `Staff`.

---

## 9. Create the Backend API Application

This application is used by the **Express.js backend** to validate tokens.

1. Inside the CRM project, click **"Applications"** tab (or **"General"** to see the app list)
2. Click **"+" New Application**
3. **Step 1 — Name and Type:**
   - Name: `crm-backend`
   - Type: **"API"** (click the API card — NOT Web, NOT Native)
   - Click **"Continue"**
4. **Step 2 — Authentication Method:**
   - Select **"Basic"** (`client_secret_basic`)
   - Click **"Continue"**
5. **Step 3 — Overview / Create:**
   - Review the settings
   - Click **"Create"**

6. ⚠️ **A popup appears showing Client ID and Client Secret**
   - **COPY BOTH IMMEDIATELY** — the Client Secret is shown ONLY ONCE
   - `ClientId: XXXXXXXXXXXXXXXXXX`
   - `ClientSecret: YYYYYYYYYYYYYYYYYYY`
   - Save them somewhere safe (e.g., your `.env` file)
7. Click **"Close"** on the popup

> If you close without copying the secret, you must click "Actions" → "Regenerate Secret" on the app page to get a new one.

---

## 10. Create the Frontend Web Application

This application is used by the **React frontend** for the Authorization Code + PKCE login flow.

1. Still in the CRM project Applications tab, click **"+" New Application** again
2. **Step 1 — Name and Type:**
   - Name: `crm-frontend`
   - Type: **"Web"** (click the Web card)
   - Click **"Continue"**
3. **Step 2 — Authentication Method:**
   - Select **"PKCE"** (Proof Key for Code Exchange)
   - Click **"Continue"**
4. **Step 3 — Redirect URIs:**
   - Redirect URI: `http://localhost:5173/callback`
   - Post Logout URI: `http://localhost:5173`
   - Click **"Continue"**
5. **Step 4 — Overview / Create:**
   - Click **"Create"**
6. A popup shows the **Client ID** (NO secret — PKCE doesn't use one)
   - Copy the Client ID
7. Click **"Close"**

> For production, change `http://localhost:5173` to your real frontend domain.

---

## 11. Create Test Users

Create at least two users — one Admin, one Staff — for testing.

1. In the Management Console top nav, click **"Users"**
2. Click **"New User"** (the blue button)

**Admin Test User:**
| Field | Value |
|-------|-------|
| First Name | `Admin` |
| Last Name | `Test` |
| Username | `admintest` |
| Email | `admin@test.com` |
| Email verified | ✅ Check this box |
| Initial Password | `Test@1234!` |

Click **"Create"**

3. Click **"New User"** again

**Staff Test User:**
| Field | Value |
|-------|-------|
| First Name | `Staff` |
| Last Name | `Test` |
| Username | `stafftest` |
| Email | `staff@test.com` |
| Email verified | ✅ Check this box |
| Initial Password | `Test@1234!` |

Click **"Create"**

> **Email verified checkbox:** Always check this in test environments so users don't need email verification to log in.

---

## 12. Assign Roles to Users

This connects users to their roles in the CRM project.

1. In the Management Console, click **"Projects"** → open **"CRM"**
2. In the left sidebar, click **"Role Assignments"** (sometimes shown as "Authorizations")
3. Click **"+ New"**
   - Type `admintest` in the user search box
   - Select `admintest` from the dropdown
   - Check the **"Admin"** role checkbox
   - Click **"Save"**
4. Click **"+ New"** again
   - Type `stafftest` in the user search box
   - Select `stafftest` from the dropdown
   - Check the **"Staff"** role checkbox
   - Click **"Save"**

5. You should now see two authorizations listed:
   ```
   admintest    Admin
   stafftest    Staff
   ```

> **Without this step, users will have NO role in their JWT** even if roles are defined on the project.

---

## 13. Configure the Backend `.env` File

Now fill in all the values you collected:

```env
# ─── SERVER ────────────────────────────────────────────────
PORT=8000

# ─── MySQL ─────────────────────────────────────────────────
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=crm_db

# ─── ZITADEL ───────────────────────────────────────────────
# The full domain of your Zitadel instance (NO trailing slash)
ZITADEL_ISSUER=https://<your-instance>.zitadel.cloud

# The PROJECT ID from Step 6 (used as JWT audience)
ZITADEL_AUDIENCE=<your-project-id>

# ─── CORS ──────────────────────────────────────────────────
CORS_ORIGIN=http://localhost:5173
```

**Where to find each value:**

| `.env` Key | Where to Find |
|------------|---------------|
| `ZITADEL_ISSUER` | Your instance domain (from Step 4), e.g. `https://crm-dev-xxxx.us1.zitadel.cloud` |
| `ZITADEL_AUDIENCE` | Project ID on the CRM project page (from Step 6) |

> **Do NOT put a trailing slash** after the issuer URL. The backend strips it automatically, but be consistent.

> **Do NOT commit `.env` to Git.** It's in `.gitignore`. Use `.env.example` as the template.

### How the `.env` maps to code:
```
ZITADEL_ISSUER  → config/index.js → zitadel.issuer
                → middleware/auth.js → JWKS URL: {issuer}/oauth/v2/keys
                → middleware/auth.js → jwt.verify({ issuer })

ZITADEL_AUDIENCE → config/index.js → zitadel.audience
                 → middleware/auth.js → jwt.verify({ audience })
```

---

## 14. Initialize the Database

Run this once to create the `crm_db` database and tables:

```bash
cd d:\tmp\backed
node db/init.js
```

OR run the SQL file manually in your MySQL GUI (DBeaver, MySQL Workbench, etc.):
- Open `db/schema.sql`
- Run it against your MySQL server

**Tables created:**
1. `customers` — id, first_name, last_name, email, phone, created_at
2. `history` — id, customer_id, subject, art, description, date, time, created_by, created_at, completed

---

## 15. Verify with Postman

### Step A — OIDC Endpoints

All endpoints are auto-discovered from the Issuer URL. The key ones are:

| Endpoint | URL |
|----------|-----|
| Discovery | `https://<instance>.zitadel.cloud/.well-known/openid-configuration` |
| Token | `https://<instance>.zitadel.cloud/oauth/v2/token` |
| Authorize | `https://<instance>.zitadel.cloud/oauth/v2/authorize` |
| JWKS | `https://<instance>.zitadel.cloud/oauth/v2/keys` |
| Userinfo | `https://<instance>.zitadel.cloud/oidc/v1/userinfo` |

### Step B — Get an Access Token in Postman

1. Open Postman → create a new Request
2. Go to **Authorization** tab → Type: **OAuth 2.0**
3. Click **"Get New Access Token"**
4. Fill in the form:

| Field | Value |
|-------|-------|
| Token Name | `CRM Admin Token` |
| Grant Type | `Authorization Code (with PKCE)` |
| Callback URL | `http://localhost:5173/callback` |
| Auth URL | `https://<instance>.zitadel.cloud/oauth/v2/authorize` |
| Access Token URL | `https://<instance>.zitadel.cloud/oauth/v2/token` |
| Client ID | `<crm-frontend client id>` |
| Client Secret | *(leave empty)* |
| Scope | `openid profile email urn:zitadel:iam:org:project:id:<PROJECT_ID>:aud` |
| Code Challenge Method | `SHA-256` |

> **The scope `urn:zitadel:iam:org:project:id:<PROJECT_ID>:aud` is critical.**  
> This tells Zitadel to: (1) include the Project ID in the `aud` claim, and (2) include roles in the token.

5. Click **"Proceed"** → a browser window opens → log in as `admintest` / `Test@1234!`
6. Postman captures the token automatically
7. Click **"Use Token"**

### Step C — Test the API

Start the backend:
```bash
cd d:\tmp\backed
npm start
```

**Test 1 — Health check (no auth):**
```
GET http://localhost:8000/api/health
```
Expected: `200 OK` → `{ "status": "ok" }`

**Test 2 — Protected route (with token):**
```
GET http://localhost:8000/api/appointments
Authorization: Bearer <paste_token_here>
```
Expected: `200 OK` → array of appointments

**Test 3 — No token (should fail):**
```
GET http://localhost:8000/api/appointments
```
Expected: `401` → `{ "error": "Missing or invalid Authorization header" }`

**Test 4 — Create customer (Admin only):**
```
POST http://localhost:8000/api/customers
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "first_name": "John",
  "last_name": "Doe",
  "email": "john@example.com",
  "phone": "0123456789"
}
```
Expected: `201 Created` with customer object

**Test 5 — Staff tries admin action (should fail):**
```
POST http://localhost:8000/api/customers
Authorization: Bearer <staff_token>
Content-Type: application/json
{ "first_name": "Test", "last_name": "User" }
```
Expected: `403` → `{ "error": "Forbidden: insufficient role" }`

**Test 6 — Add history entry:**
```
POST http://localhost:8000/api/customers/1/history
Authorization: Bearer <any_token>
Content-Type: application/json

{
  "subject": "First Appointment",
  "art": "appointment",
  "date": "2026-03-10",
  "time": "10:00:00",
  "description": "Initial consultation"
}
```
Expected: `201 Created` with history object

**Test 7 — Mark appointment complete:**
```
PATCH http://localhost:8000/api/appointments/1/complete
Authorization: Bearer <any_token>
```
Expected: `204 No Content`

---

## 16. Common Errors & Fixes

### ❌ `Invalid or expired token` — `jwt issuer invalid`
**Cause:** The `iss` claim in the JWT doesn't match `ZITADEL_ISSUER` in `.env`  
**Fix:** Make sure `ZITADEL_ISSUER` has **no trailing slash**.  
```env
# ✅ Correct
ZITADEL_ISSUER=https://demotask-8o6xcx.us1.zitadel.cloud

# ❌ Wrong
ZITADEL_ISSUER=https://demotask-8o6xcx.us1.zitadel.cloud/
```

### ❌ `Invalid or expired token` — `jwt audience invalid`
**Cause:** The `aud` claim in the JWT doesn't contain the Project ID  
**Fix 1:** Make sure `ZITADEL_AUDIENCE` = the **Project ID** (not Client ID)  
**Fix 2:** Make sure the Postman scope includes `urn:zitadel:iam:org:project:id:<PROJECT_ID>:aud`

### ❌ `Forbidden: no role` on all requests
**Cause:** Role assertions are not enabled on the project  
**Fix:** Go to Zitadel Console → Projects → CRM → General → Enable **"Assert Roles on Authentication"** → Save

### ❌ `Forbidden: no role` for a specific user
**Cause:** User doesn't have a role assignment in the project  
**Fix:** Go to Projects → CRM → Role Assignments → Assign the correct role to the user

### ❌ `error fetching JWKS` or `No signing key found`
**Cause:** Wrong JWKS URI in `middleware/auth.js`  
**Fix:** Zitadel uses `/oauth/v2/keys`, NOT `/.well-known/jwks.json`
```js
// ✅ Correct (already fixed in this project)
jwksUri: `${config.zitadel.issuer}/oauth/v2/keys`

// ❌ Wrong
jwksUri: `${config.zitadel.issuer}/.well-known/jwks.json`
```

### ❌ `net::ERR_CONNECTION_REFUSED` on backend
**Cause:** Backend isn't running  
**Fix:** Run `npm start` in the `backed/` directory

### ❌ `ER_ACCESS_DENIED_ERROR` MySQL
**Cause:** Wrong DB credentials in `.env`  
**Fix:** Check `DB_USER`, `DB_PASSWORD`, `DB_HOST` in `.env`

### ❌ `Table 'crm_db.customers' doesn't exist`
**Cause:** Database not initialized  
**Fix:** Run `node db/init.js` or execute `db/schema.sql` manually

### ❌ Token works but role is `null`
**Cause:** `normalizeRole()` not handling Zitadel's object format  
**Zitadel actual JWT format:**
```json
{
  "urn:zitadel:iam:org:project:roles": {
    "Admin": { "orgId123": "orgDomain" }
  }
}
```
**Fix:** The `normalizeRole()` function in `middleware/auth.js` already handles this  
(it checks `typeof rolesClaim === 'object'` first)

---

## 17. How JWT Auth Works in This Project

```
1. Client sends:
   GET /api/appointments
   Authorization: Bearer eyJhbGciOiJSUzI1NiIs...

2. middleware/auth.js (requireAuth) runs:
   a. Extract token from "Bearer ..."
   b. Decode the JWT header to get "kid" (Key ID)
   c. Fetch the public key for that kid from:
      https://<instance>.zitadel.cloud/oauth/v2/keys
   d. Verify JWT signature using the public key
   e. Verify: issuer === ZITADEL_ISSUER
   f. Verify: audience includes ZITADEL_AUDIENCE (project ID)
   g. Verify: token not expired

3. If valid:
   req.user = {
     sub: "user-id-from-zitadel",   // used for ownership checks
     role: "Admin" | "Staff" | null  // from urn:zitadel:iam:org:project:roles
   }
   → next() runs the actual route handler

4. If invalid:
   → 401 { error: "Invalid or expired token" }

5. Route handlers check req.user.role for Admin/Staff access:
   - POST /api/customers       → requireAdmin (only Admin)
   - GET  /api/appointments     → requireStaff (Admin OR Staff)
   - PUT  /api/customers/x/history/y → ownership check: created_by === sub
```

---

## 18. Key Concepts Explained

### What is the Issuer URL?
The domain of your Zitadel instance. Example: `https://demotask-8o6xcx.us1.zitadel.cloud`.  
Every JWT contains `"iss": "https://demotask-8o6xcx.us1.zitadel.cloud"`.  
The backend must match this exactly.

### What is the Audience (`aud`)?
The audience tells Zitadel "who is this token for". We use the **Project ID** as the audience.  
This ensures tokens issued for other projects/apps won't work on our backend.  
Every JWT contains `"aud": ["362714480683006278"]`.

### What is PKCE?
Proof Key for Code Exchange. A security mechanism for public clients (like React) that prevents auth code interception attacks. No client secret is needed — the browser generates a random code challenge instead.

### What is JWKS?
JSON Web Key Set. Zitadel publishes its public keys at `/oauth/v2/keys`.  
The backend fetches these public keys to verify that a JWT was really signed by Zitadel (not forged).

### What is `sub`?
The `sub` (subject) claim in the JWT is the unique user ID in Zitadel.  
The backend stores this as `created_by` in the `history` table for ownership checks.

### API App vs Web App
| | API App (`crm-backend`) | Web App (`crm-frontend`) |
|---|---|---|
| **Used by** | Express backend (for introspection) | React frontend (for login) |
| **Auth method** | Basic (client_secret_basic) | PKCE (no secret) |
| **Has secret?** | ✅ Yes (keep safe) | ❌ No |
| **Used in** | Backend `.env` (NOT directly) | Frontend `.env` |

> **Note for this project:** The backend doesn't use the `crm-backend` Client ID/Secret directly for token validation — it only uses the JWKS public key. The API app is there for potential future use (e.g., introspection endpoint).

---

## 📌 Quick Reference Checklist

Copy this checklist when setting up for a new environment:

```
□ 1. Create Zitadel Cloud account at zitadel.com
□ 2. Create Instance (name it, select region)
□ 3. Note the INSTANCE DOMAIN (Issuer URL)
□ 4. Open Management Console
□ 5. Create Project named "CRM"
□ 6. Note the PROJECT ID
□ 7. Enable "Assert Roles on Authentication" in Project → General
□ 8. Add Role: Admin (key=Admin, group=crm)
□ 9. Add Role: Staff (key=Staff, group=crm)
□ 10. Create Application: crm-backend (type=API, auth=Basic)
□ 11. COPY Client ID and Client Secret immediately from popup
□ 12. Create Application: crm-frontend (type=Web, auth=PKCE)
□ 13. Set Redirect URI: http://localhost:5173/callback
□ 14. COPY crm-frontend Client ID
□ 15. Create user: admintest (email verified, password set)
□ 16. Create user: stafftest (email verified, password set)
□ 17. Assign role Admin to admintest (Projects → CRM → Role Assignments)
□ 18. Assign role Staff to stafftest
□ 19. Update .env: ZITADEL_ISSUER and ZITADEL_AUDIENCE
□ 20. Run: node db/init.js
□ 21. Run: npm start
□ 22. Test /api/health → 200 OK
□ 23. Get token in Postman, test /api/appointments
```

---

*Last updated: March 2026 | Instance: demotask-8o6xcx.us1.zitadel.cloud*
