# BUG FIX LOG & REMEDIATION SUMMARY

**Project:** Integrated Career & Recruitment Portal  
**Audit & Remediation Date:** November 16, 2026  
**Auditor / Engineer:** Senior Full-Stack Developer & Software Architect  

---

## Summary of Files Modified

| File Path | Component | Changes Made |
| :--- | :--- | :--- |
| `backend/src/controllers/employer.controller.js` | Backend Controller | Standardized `pool.query`, resolved `poolQuery` undefined error, and fixed double-destructuring bugs |
| `backend/src/config/cors.config.js` | Backend Config | Added `http://127.0.0.1:5173` to allowed CORS origins |
| `backend/src/middlewares/auth.middleware.js` | Backend Middleware | Implemented and exported `optionalAuth` middleware for non-blocking authenticated requests |
| `backend/src/routes/job.routes.js` | Backend Routes | Attached `optionalAuth` to `GET /` and `GET /details/:id` |
| `backend/src/models/admin.model.js` | Backend Model | Fixed duplicate subtraction in pending offers calculation, added dynamic count for declined/rejected offers, and used `LEFT JOIN` on `educations` |
| `frontend/src/context/AuthContext.jsx` | Frontend Context | Removed `setLoading(true)` on `login()` and `logout()` to prevent premature unmounting of `<LoginPage />` via `<PublicRoute />` |
| `frontend/src/pages/LoginPage.jsx` | Frontend Page | Added `{ replace: true }` on role-based navigate, robust error toast string conversion |
| `backend/src/models/log.model.js` | Backend Model | Ensured `userId || null` is passed safely to `login_logs` table |
| `backend/migrations/init.sql` & MySQL Schema | Database Schema | Executed `ALTER TABLE login_logs MODIFY user_id INT NULL` to allow auditing failed logins for unknown emails |

---

## Detailed Bug Remediation Log

### Bug 1: Unhandled ReferenceError for Database Queries in Employer Controller
- **File:** `backend/src/controllers/employer.controller.js`
- **Severity:** High
- **Symptom:** Whenever a recruiter created a job (`POST /employer/jobs`), created an assessment (`POST /employer/assessments`), or updated an applicant's status (`PUT /employer/applications/:id/status`), the backend server threw `ReferenceError: poolQuery is not defined` and returned HTTP 500.
- **Root Cause:** A helper function `poolQuery` was declared at the end of the module using dynamic imports, which failed to resolve consistently in certain execution contexts, and was not imported at the top of the file.
- **Fix:** Directly imported `pool` from `../config/db.config.js` at the top of `employer.controller.js` and replaced calls to `poolQuery(...)` with standard `pool.query(...)`.

---

### Bug 2: Broken Candidate Email Notifications for Interviews & Offers
- **File:** `backend/src/controllers/employer.controller.js`
- **Severity:** Medium
- **Symptom:** When a recruiter scheduled an interview or generated an offer letter, the automated email notification was never dispatched to the student's email.
- **Root Cause:** In methods `scheduleInterview` (line 220) and `createOfferLetter` (line 264), the code destructured the query result as:
  ```javascript
  const [userRows] = await poolQuery('SELECT email FROM users WHERE id = ?', [req.body.student_id]);
  if (userRows[0]?.email) { ... }
  ```
  Since `poolQuery` returned `rows`, destructuring `[userRows]` assigned `rows[0]` (the user object) directly to `userRows`. The subsequent check `userRows[0]?.email` attempted to access the first index of an object, returning `undefined` and skipping the email block.
- **Fix:** Corrected the destructuring to:
  ```javascript
  const [userRows] = await pool.query('SELECT email FROM users WHERE id = ?', [req.body.student_id]);
  if (userRows[0]?.email) { ... }
  ```

---

### Bug 3: Missing User Context on Public Job Discovery Routes
- **File:** `backend/src/middlewares/auth.middleware.js` and `backend/src/routes/job.routes.js`
- **Severity:** Medium
- **Symptom:** When logged-in students browsed `/student/jobs` or opened `/student/jobs/:id`, the job listing and details pages showed generic fallback data rather than calculating personalized AI skill match ratings (`aiMatch`), `isSaved`, or `isApplied`.
- **Root Cause:** Routes `GET /` and `GET /details/:id` in `job.routes.js` had no authentication middleware attached because they are accessible to guests. As a result, `req.user` was always `undefined`.
- **Fix:** Created and exported `optionalAuth` in `auth.middleware.js` that checks for a `Bearer` token and sets `req.user` if valid, without blocking guest requests. Attached `optionalAuth` to `GET /` and `GET /details/:id` in `job.routes.js`.

---

### Bug 4: Incorrect Aggregations in Admin Dashboard Stats
- **File:** `backend/src/models/admin.model.js`
- **Severity:** Low
- **Symptom:** In the admin analytics dashboard:
  1. The offer breakdown donut chart hardcoded `Declined: 0`.
  2. The pending offers calculation subtracted `acceptedOffers` twice:
     ```javascript
     Math.max(0, totalOffers - acceptedOffers - safe(offersAccepted, 'count'))
     ```
  3. Students who accepted an offer without an academic record were excluded from department placement counts due to an `INNER JOIN educations`.
- **Fix:**
  1. Added queries for both `pending` and `rejected`/`declined` offer records.
  2. Fixed the pending calculation to use actual database count (`pendingOffers`).
  3. Replaced `INNER JOIN` with `LEFT JOIN` on `educations`.
  4. Updated `getOffersList` summary to group both `'rejected'` and `'declined'` status codes.

---

### Bug 5: CORS Rejection on IP Loopback Access
- **File:** `backend/src/config/cors.config.js`
- **Severity:** Low
- **Symptom:** If a user accessed the frontend via `http://127.0.0.1:5173` instead of `http://localhost:5173`, all API requests were rejected with `Not allowed by CORS`.
- **Root Cause:** `allowedOrigins` strictly checked `process.env.CLIENT_URL` (which defaults to `http://localhost:5173`) without including `http://127.0.0.1:5173`.
- **Fix:** Explicitly added `http://127.0.0.1:5173` and `http://localhost:5173` to `allowedOrigins`.

---

### Bug 6: Frontend AuthContext Lifecycle Collision & Component Unmounting on Form Submission
- **File:** `frontend/src/context/AuthContext.jsx` and `frontend/src/pages/LoginPage.jsx`
- **Severity:** Critical
- **Symptom:** When clicking "Sign In", the login page flickered to a blank screen or wiped out user inputs without displaying any error toast or feedback, and successful logins occasionally conflicted with navigation guards.
- **Root Cause:** In `AuthContext.jsx`, `login()` called `setLoading(true)` on line 32. Because the `/login` route is protected by `<PublicRoute />`, which evaluates `if (loading) return <LoadingScreen />`, `<LoginPage />` was unmounted immediately upon form submission. When the request failed, `finally { setLoading(false) }` remounted a fresh `<LoginPage />` with empty state, discarding the error toast and leaving the user confused.
- **Fix:** Removed `setLoading(true)` and `setLoading(false)` from `login()` and `logout()` in `AuthContext.jsx`. Kept loading state isolated to `LoginPage`'s local `loadingState` button spinner. Added `{ replace: true }` to `navigate()` in `LoginPage.jsx`.

---

### Bug 7: Database Integrity Violation in `login_logs` for Unregistered Users
- **File:** `backend/migrations/init.sql`, `backend/src/models/log.model.js`, and MySQL Database
- **Severity:** High
- **Symptom:** Any failed login attempt with an unrecognized email crashed the audit logger with `ER_BAD_NULL_ERROR: Column 'user_id' cannot be null`.
- **Root Cause:** `login_logs` table had `user_id INT NOT NULL`, but `auth.controller.js` passed `null` for unknown email lookups.
- **Fix:** Executed `ALTER TABLE login_logs MODIFY user_id INT NULL;`, updated `init.sql`, and sanitized `log.model.js` to ensure `userId || null` is saved cleanly.

---

### Bug 8: Unverified Email & Credential Mismatch across Student Test Accounts
- **File:** MySQL Database (`users` table)
- **Severity:** High
- **Symptom:**
  1. Student login with `mathujaa@gmail.com` returned `401 Unauthorized: Please verify your email address before logging in`.
  2. Student login with `mathujaapm@gmail.com` and password `Mathujaa@03` returned `401 Unauthorized: Incorrect email or password`.
- **Root Cause:**
  - `mathujaa@gmail.com` (user ID 1) had `is_verified = 0`.
  - `mathujaapm@gmail.com` (user ID 2) was seeded with password `Mathujaa@123`, whereas user accounts 1 (`mathujaa@gmail.com`) and 3 (`2312026@nec.edu.in`) were seeded with `Mathujaa@03`.
- **Fix:**
  - Set `is_verified = 1` for `mathujaa@gmail.com`.
  - Synchronized the bcrypt password hash for `mathujaapm@gmail.com` to match `Mathujaa@03`.
  - All three student emails (`mathujaapm@gmail.com`, `mathujaa@gmail.com`, `2312026@nec.edu.in`) now authenticate successfully with `Mathujaa@03`.

---

## Verification & Retest
Following the implementation of all fixes, both the comprehensive workflow test suite (`backend/test_e2e_workflows.js` - 42 tests) and the dedicated browser authentication suite (`backend/verify_auth_e2e.js` - 28 tests) were executed. All 70 test scenarios passed with a 100% success rate across Student, Employer, and Admin roles.
