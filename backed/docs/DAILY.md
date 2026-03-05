# CRM Backend – Daily Log

## 2025-03-05

### Today we did

- **Config & env:** Added `dotenv`, `config/index.js`, and `.env.example` for PORT, DB (host, user, password, database), ZITADEL (issuer, audience), and CORS origin. All env is documented and read from one place.
- **Database:** Added `db/connection.js` (MySQL pool via `mysql2`), `db/schema.sql` (customers + history tables with FKs and indexes), and optional `db/init.js` for local setup. Schema includes `completed` flag on history so appointments are hidden from the list when completed but kept in DB for History tab.
- **Auth middleware:** Implemented `middleware/auth.js`: JWT validation using JWKS from ZITADEL issuer (signature, issuer, audience), extraction of `sub` and role from token claims. Role normalized to Admin/Staff from `urn:zitadel:iam:org:project:roles`. Added `middleware/roles.js` for `requireAdmin` and `requireStaff`.
- **Appointments API:** `routes/appointments.js` – GET list (join customers + history, `art = 'appointment'`, `completed = 0`), PATCH `:id/complete` (set `completed = 1`). All routes protected by JWT + Staff/Admin.
- **Customers API:** `routes/customers.js` – GET list, GET `:id`, POST create (Admin only). Staff has read-only access.
- **History API:** `routes/history.js` – GET/POST `/api/customers/:customerId/history`, PUT/DELETE `.../history/:id`. Ownership: Admin can edit/delete any; Staff only when `created_by === token.sub`. New entries store `created_by` from token.
- **App wiring:** Updated `app.js`: CORS from config, GET `/api/health` (no auth), mount of `/api/appointments`, `/api/customers`, `/api/customers/:customerId/history`. API errors return JSON; non-API errors still use error view.

### Done

- Backend implements TASKOVERVIEW: JWT validation (signature, iss, aud), roles from token, appointments list and mark completed, customers CRUD (Admin create), history CRUD with ownership. DB schema and comments in code explain design choices. Ready for frontend integration.
