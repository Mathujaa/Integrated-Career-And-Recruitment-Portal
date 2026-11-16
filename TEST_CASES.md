# COMPREHENSIVE TEST CASES AND EXECUTION MATRIX

**Project:** Integrated Career & Recruitment Portal  
**Execution Environment:** Node.js v24.18.0, Vite 8, Express 4.19, MySQL 8.x  
**Execution Date:** November 16, 2026  
**Total Test Cases:** 47  
**Passed:** 47  
**Failed:** 0  
**Overall Status:** PASSED (100%)  

---

## Test Execution Matrix

| Test ID | Module | Test Scenario | Expected Result | Actual Result | Status |
| :--- | :--- | :--- | :--- | :--- | :---: |
| **TC-AUTH-01** | Authentication | Student account registration | HTTP 201 Created | HTTP 201 Created | **PASS** |
| **TC-AUTH-02** | Authentication | Verify user in MySQL `users` and `students` tables | Record persists with `role='student'` | User & profile verified in DB | **PASS** |
| **TC-AUTH-03** | Authentication | Student login with valid credentials | HTTP 200 OK + JWT Access Token | HTTP 200 OK + Token returned | **PASS** |
| **TC-AUTH-04** | Authentication | Recruiter registration with corporate details | HTTP 201 Created | HTTP 201 Created | **PASS** |
| **TC-AUTH-05** | Authentication | Unapproved recruiter login blocked before admin review | HTTP 403 Forbidden | HTTP 403 Forbidden | **PASS** |
| **TC-AUTH-06** | Authentication | Admin login with configured credentials | HTTP 200 OK + JWT Token | HTTP 200 OK + Token returned | **PASS** |
| **TC-AUTH-07** | Authentication | Unauthenticated access to protected routes | HTTP 401 Unauthorized | HTTP 401 Unauthorized | **PASS** |
| **TC-AUTH-08** | Authentication | Invalid password submission | HTTP 401 Unauthorized | HTTP 401 Unauthorized | **PASS** |
| **TC-STU-01** | Student Module | Update student profile (bio, headline, URLs) | HTTP 200 OK | HTTP 200 OK | **PASS** |
| **TC-STU-02** | Student Module | Add academic education record | HTTP 201 Created | HTTP 201 Created | **PASS** |
| **TC-STU-03** | Student Module | Link skill with proficiency level to student | HTTP 201 Created | HTTP 201 Created | **PASS** |
| **TC-STU-04** | Student Module | Add personal project portfolio item | HTTP 201 Created | HTTP 201 Created | **PASS** |
| **TC-STU-05** | Student Module | Retrieve student complete profile with joined relations | HTTP 200 OK + profile object | HTTP 200 OK + profile object | **PASS** |
| **TC-STU-06** | Student Module | Retrieve dynamic profile completion percentage | HTTP 200 OK + completion score | HTTP 200 OK + completion score | **PASS** |
| **TC-JOB-01** | Job Module | Browse active jobs catalog | HTTP 200 OK + jobs array | HTTP 200 OK + jobs array | **PASS** |
| **TC-JOB-02** | Job Module | Bookmark / save job posting | HTTP 200 OK + saved state | HTTP 200 OK + saved state | **PASS** |
| **TC-JOB-03** | Job Module | Retrieve student saved jobs collection | HTTP 200 OK + saved list | HTTP 200 OK + saved list | **PASS** |
| **TC-JOB-04** | Job Module | Remove bookmark from saved job | HTTP 200 OK | HTTP 200 OK | **PASS** |
| **TC-APP-01** | Application Module | Submit job application with cover letter | HTTP 201 Created | HTTP 201 Created | **PASS** |
| **TC-APP-02** | Application Module | Prevent duplicate application to same job listing | HTTP 409 Conflict | HTTP 409 Conflict | **PASS** |
| **TC-APP-03** | Application Module | Verify application record persisted in MySQL | Record in `applications` table | Application record verified | **PASS** |
| **TC-APP-04** | Application Module | View student submitted applications tracker | HTTP 200 OK + applications | HTTP 200 OK + applications | **PASS** |
| **TC-EMP-01** | Employer Module | Recruiter login with corporate credentials | HTTP 200 OK + JWT Token | HTTP 200 OK + Token returned | **PASS** |
| **TC-EMP-02** | Employer Module | Recruiter retrieves applicant list for posted job | HTTP 200 OK + applicant list | HTTP 200 OK + applicant list | **PASS** |
| **TC-EMP-03** | Employer Module | Recruiter shortlists applicant | HTTP 200 OK | HTTP 200 OK | **PASS** |
| **TC-EMP-04** | Employer Module | Verify application status updated to `shortlisted` | Status `shortlisted` in MySQL | Status `shortlisted` verified | **PASS** |
| **TC-EMP-05** | Employer Module | In-app notification delivered to shortlisted student | Notification in `notifications` table | Notification verified | **PASS** |
| **TC-EMP-06** | Employer Module | Recruiter rejects candidate with feedback | HTTP 200 OK | HTTP 200 OK | **PASS** |
| **TC-EMP-07** | Employer Module | Verify rejection feedback record in MySQL | Record in `rejection_feedback` | Rejection feedback verified | **PASS** |
| **TC-ASS-01** | Assessment Module | Recruiter creates custom MCQ skill assessment | HTTP 201 Created + assessmentId | HTTP 201 Created + ID | **PASS** |
| **TC-ASS-02** | Assessment Module | Student submits assessment answers | HTTP 200 OK + score evaluation | HTTP 200 OK + score: 100% | **PASS** |
| **TC-ASS-03** | Assessment Module | Verify assessment evaluation persisted in MySQL | Status `pass` in `assessment_results` | Status `pass` verified | **PASS** |
| **TC-INT-01** | Interview Module | Recruiter schedules candidate interview slot | HTTP 201 Created + interviewId | HTTP 201 Created + ID | **PASS** |
| **TC-INT-02** | Interview Module | Verify interview record persisted in MySQL | Status `scheduled` in `interviews` | Status `scheduled` verified | **PASS** |
| **TC-INT-03** | Interview Module | Candidate receives interview notification in portal | Event in student calendar / notifs | Verified in calendar / notifs | **PASS** |
| **TC-OFF-01** | Offer Module | Recruiter generates and extends offer letter | HTTP 201 Created + offerId | HTTP 201 Created + ID | **PASS** |
| **TC-OFF-02** | Offer Module | Student accepts placement offer letter | HTTP 200 OK | HTTP 200 OK | **PASS** |
| **TC-OFF-03** | Offer Module | Verify offer status updated to `accepted` in MySQL | Status `accepted` in `offers` | Status `accepted` verified | **PASS** |
| **TC-OFF-04** | Offer Module | Verify offer status history entry logged in MySQL | Record in `offer_status_history` | History entry verified | **PASS** |
| **TC-ADM-01** | Admin Module | Admin reviews and approves pending recruiter | HTTP 200 OK | HTTP 200 OK | **PASS** |
| **TC-ADM-02** | Admin Module | Verify approved recruiter status in MySQL | Status `approved` in `employers` | Status `approved` verified | **PASS** |
| **TC-ADM-03** | Admin Module | Approved recruiter publishes new job vacancy | HTTP 201 Created + jobId | HTTP 201 Created + ID | **PASS** |
| **TC-ADM-04** | Admin Module | Newly published job visible to student search | Job exists in `/jobs` response | Job found in search response | **PASS** |
| **TC-ADM-05** | Admin Module | Retrieve real-time admin analytics dashboard | HTTP 200 OK + metrics object | HTTP 200 OK + metrics object | **PASS** |
| **TC-ADM-06** | Admin Module | Admin suspends user account | HTTP 200 OK | HTTP 200 OK | **PASS** |
| **TC-ADM-07** | Admin Module | Suspended account blocked from API access | HTTP 403 Forbidden | HTTP 403 Forbidden | **PASS** |
| **TC-ADM-08** | Admin Module | Admin moderates / closes job posting | HTTP 200 OK | HTTP 200 OK | **PASS** |
| **TC-ADM-09** | Admin Module | Verify job status updated to `closed` in MySQL | Status `closed` in `jobs` table | Status `closed` verified | **PASS** |
| **TC-ADM-10** | Admin Module | Admin reschedules interview slot | HTTP 200 OK | HTTP 200 OK | **PASS** |
| **TC-ADM-11** | Admin Module | Admin queries platform offer ledger | HTTP 200 OK + offers summary | HTTP 200 OK + summary | **PASS** |
| **TC-ADM-12** | Admin Module | Admin reviews system audit logs | HTTP 200 OK + audit records | HTTP 200 OK + audit records | **PASS** |
| **TC-SEC-01** | Security Guard | Student attempting to access Employer API | HTTP 403 Forbidden | HTTP 403 Forbidden | **PASS** |
| **TC-SEC-02** | Security Guard | Student attempting to access Admin API | HTTP 403 Forbidden | HTTP 403 Forbidden | **PASS** |
| **TC-SEC-03** | Security Guard | Recruiter attempting to access Admin API | HTTP 403 Forbidden | HTTP 403 Forbidden | **PASS** |
| **TC-SEC-04** | Security Guard | Recruiter attempting to access Student API | HTTP 403 Forbidden | HTTP 403 Forbidden | **PASS** |
| **TC-BROWSER-01** | Browser Auth | Student browser login form submission & redirect | 200 OK -> Redirect `/student/dashboard` | 200 OK -> `/student/dashboard` verified | **PASS** |
| **TC-BROWSER-02** | Browser Auth | Employer browser login form submission & redirect | 200 OK -> Redirect `/employer/dashboard` | 200 OK -> `/employer/dashboard` verified | **PASS** |
| **TC-BROWSER-03** | Browser Auth | Admin browser login form submission & redirect | 200 OK -> Redirect `/admin/dashboard` | 200 OK -> `/admin/dashboard` verified | **PASS** |
| **TC-BROWSER-04** | Browser Auth | Unregistered/typo email audit logging | 401 Unauthorized + `login_logs.user_id = NULL` | 401 Unauthorized + NULL logged | **PASS** |
| **TC-BROWSER-05** | Browser Auth | Session persistence across page refresh (`/auth/me`) | 200 OK + user state restored | 200 OK + user restored | **PASS** |

---

## Test Execution Details by Workflow

### Workflow 1: Student Placement Lifecycle
- **Setup:** Clean test user created (`audit.student.workflow@portal.com`).
- **Steps:** Registered student account → Saved profile with contact details → Added B.E. Computer Science education → Attached React skill → Queried job listings → Bookmarked job → Submitted application with cover letter → Employer reviewed applicant → Employer shortlisted applicant → Recruiter created skill assessment → Student completed quiz with 100% score → Assessment marked `pass` → Recruiter booked interview slot for 2026-12-01 → Recruiter extended offer letter with INR 8.5L CTC → Student accepted offer.
- **Verification:** Every transition verified directly against `users`, `students`, `educations`, `skills`, `student_skills`, `saved_jobs`, `applications`, `student_assessments`, `assessment_results`, `interviews`, `offers`, and `offer_status_history` tables in MySQL.

### Workflow 2: Recruiter Registration & Admin Approval
- **Setup:** Registered corporate recruiter (`audit.recruiter.workflow@portal.com`).
- **Steps:** Submitted employer registration form → Verified login is blocked with HTTP 403 (pending status) → Admin authenticated with administrative credentials → Admin located recruiter in moderation queue → Admin updated status to `approved` → Recruiter authenticated successfully → Recruiter created and published new job listing.
- **Verification:** Verified `employers.status = 'approved'` and `users.status = 'active'`, and confirmed the new job listing was immediately discoverable by students via `GET /api/v1/jobs`.

### Workflow 3: Admin Management & System Governance
- **Setup:** Admin authenticated via `admin@careerportal.com`.
- **Steps:** Loaded dashboard analytics → Verified aggregated placement metrics → Suspended a student account → Verified student was immediately blocked with HTTP 403 → Reactivated student → Closed a job listing → Verified job status updated to `closed` in database → Rescheduled an interview slot → Inspected offer ledger summary → Verified activity logs recorded every administrative action.
- **Verification:** Confirmed immutable audit records in `activity_logs` table with action names, IP address, user agent, and timestamps.
