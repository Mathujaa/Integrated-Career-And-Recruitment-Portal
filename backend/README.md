# Integrated Career & Recruitment Portal - Backend API Documentation

Welcome to the backend server API documentation. This section covers Stage 1 of the Authentication Module, detailing endpoints, security features, input validation schema, response status codes, and instructions for testing.

---

## 1. System Requirements & Setup

### Environment Variables
Configure the environment file in `backend/.env` based on `backend/.env.example`:
- `PORT` (defaults to `5000`)
- `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `DB_PORT` (configured for your MySQL database instance)
- `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET` (at least 32 character cryptographic secrets)
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` (configured for Nodemailer mock mailboxes like Mailtrap or custom SMTP)
- `CLIENT_URL` (CORS whitelisted origins, e.g. `http://localhost:5173`)

### Installation & Execution
```powershell
# Navigate to the backend directory
cd backend

# Install dependencies
npm install

# Run backend with hot reloading (Development)
npm run dev

# Run backend (Production)
npm start
```

---

## 2. API Endpoint Directory

All endpoints are prefixed with `/api/v1`.

| HTTP Method | Endpoint Path | Request Body Type | Auth Required | Description |
| :--- | :--- | :--- | :--- | :--- |
| **GET** | `/health` | None | No | Checks server and database connection health |
| **POST** | `/api/v1/auth/register/student` | JSON | No | Registers a student user and creates their profile |
| **POST** | `/api/v1/auth/register/employer` | JSON | No | Registers an employer user and profile |
| **POST** | `/api/v1/auth/verify-email` | JSON | No | Verifies email verification tokens |
| **POST** | `/api/v1/auth/login` | JSON | No | Verifies credentials, logs logins, sets HTTP cookies |
| **POST** | `/api/v1/auth/refresh-token` | Cookies (HTTP-only) | No | Rotates/invalidates old refresh and access tokens |
| **POST** | `/api/v1/auth/forgot-password` | JSON | No | Generates single-use recovery code and dispatches mail |
| **POST** | `/api/v1/auth/reset-password` | JSON | No | Updates password and revokes all active refresh sessions |
| **GET** | `/api/v1/auth/me` | None (Bearer Header) | Yes | Fetches authenticated user info + profile subclass data |
| **POST** | `/api/v1/auth/logout` | None (Bearer Header) | Yes | Revokes refresh tokens and clears HTTP-only cookies |

---

## 3. Endpoints - Detailed Specifications

### System Health Check
- **Endpoint:** `GET /health`
- **Authentication:** None
- **Response Examples:**
  - **`200 OK`**:
    ```json
    {
      "status": "success",
      "message": "Backend server is healthy and running.",
      "timestamp": "2026-07-12T09:32:12.000Z"
    }
    ```

---

### Student Registration
- **Endpoint:** `POST /api/v1/auth/register/student`
- **Authentication:** None
- **Request Body:**
  ```json
  {
    "first_name": "John",
    "last_name": "Doe",
    "email": "student.doe@example.com",
    "password": "SecurePass123!",
    "phone": "9876543210"
  }
  ```
- **Response Examples:**
  - **`201 Created`**:
    ```json
    {
      "status": "success",
      "message": "Registration successful. Please check your email to verify your account."
    }
    ```
  - **`400 Bad Request`** (Validation Failure):
    ```json
    {
      "status": "fail",
      "message": "Validation failed: First name is required., Please provide a valid email address."
    }
    ```
  - **`409 Conflict`** (Duplicate Email):
    ```json
    {
      "status": "fail",
      "message": "A record with this email or profile information already exists."
    }
    ```

---

### Employer Registration
- **Endpoint:** `POST /api/v1/auth/register/employer`
- **Authentication:** None
- **Request Body:**
  ```json
  {
    "company_name": "Tech Solutions Inc.",
    "email": "hr@techsolutions.com",
    "password": "SecurePass123!",
    "phone": "9876543211"
  }
  ```
- **Response Examples:**
  - **`201 Created`**:
    ```json
    {
      "status": "success",
      "message": "Registration successful. Please check your email to verify your account."
    }
    ```
  - **`400 Bad Request`** (Validation Failure):
    ```json
    {
      "status": "fail",
      "message": "Validation failed: Company name is required."
    }
    ```

---

### Verify Email
- **Endpoint:** `POST /api/v1/auth/verify-email`
- **Authentication:** None
- **Request Body:**
  ```json
  {
    "token": "4a081f21568c07e2ab7b9264fa58d203"
  }
  ```
- **Response Examples:**
  - **`200 OK`**:
    ```json
    {
      "status": "success",
      "message": "Email verified successfully. You can now login."
    }
    ```
  - **`400 Bad Request`** (Invalid or Expired Token):
    ```json
    {
      "status": "fail",
      "message": "Invalid or expired verification token."
    }
    ```

---

### Login User
- **Endpoint:** `POST /api/v1/auth/login`
- **Authentication:** None
- **Request Body:**
  ```json
  {
    "email": "student.doe@example.com",
    "password": "SecurePass123!"
  }
  ```
- **Set-Cookie Header:**
  - `refreshToken=<token>; Max-Age=604800; Path=/; HttpOnly; SameSite=Strict; Secure` (in production)
- **Response Examples:**
  - **`200 OK`**:
    ```json
    {
      "status": "success",
      "token": "eyJhbGciOiJIUzI1NiIsIn...",
      "user": {
        "id": 1,
        "email": "student.doe@example.com",
        "role": "student",
        "is_verified": true,
        "profile": {
          "id": 1,
          "first_name": "John",
          "last_name": "Doe",
          "phone": "9876543210",
          "avatar_url": null
        }
      }
    }
    ```
  - **`401 Unauthorized`** (Invalid Credentials):
    ```json
    {
      "status": "fail",
      "message": "Incorrect email or password."
    }
    ```
  - **`401 Unauthorized`** (Unverified Email):
    ```json
    {
      "status": "fail",
      "message": "Please verify your email address before logging in."
    }
    ```
  - **`403 Forbidden`** (Account Suspended):
    ```json
    {
      "status": "fail",
      "message": "Your account has been suspended. Please contact support."
    }
    ```

---

### Rotate Refresh Token
- **Endpoint:** `POST /api/v1/auth/refresh-token`
- **Authentication:** Requires `refreshToken` set in HTTP-only Cookie
- **Response Examples:**
  - **`200 OK`**:
    ```json
    {
      "status": "success",
      "token": "eyJhbGciOiJIUzI1NiIsIn..."
    }
    ```
  - **`401 Unauthorized`**:
    ```json
    {
      "status": "fail",
      "message": "Access Denied. No refresh token provided."
    }
    ```

---

### Request Password Reset
- **Endpoint:** `POST /api/v1/auth/forgot-password`
- **Authentication:** None
- **Request Body:**
  ```json
  {
    "email": "student.doe@example.com"
  }
  ```
- **Response Examples:**
  - **`200 OK`** (Security Safe Response):
    ```json
    {
      "status": "success",
      "message": "If the email matches an active account, a password reset link will be sent."
    }
    ```

---

### Execute Password Reset
- **Endpoint:** `POST /api/v1/auth/reset-password`
- **Authentication:** None
- **Request Body:**
  ```json
  {
    "token": "reset_token_here",
    "password": "NewSecurePass456!"
  }
  ```
- **Response Examples:**
  - **`200 OK`**:
    ```json
    {
      "status": "success",
      "message": "Password reset successfully. You can now login."
    }
    ```
  - **`400 Bad Request`**:
    ```json
    {
      "status": "fail",
      "message": "Invalid or expired password reset token."
    }
    ```

---

### Get Authenticated User (Me)
- **Endpoint:** `GET /api/v1/auth/me`
- **Authentication:** Bearer token inside `Authorization` Header: `Bearer <accessToken>`
- **Response Examples:**
  - **`200 OK`**:
    ```json
    {
      "status": "success",
      "user": {
        "id": 1,
        "email": "student.doe@example.com",
        "role": "student",
        "is_verified": true,
        "profile": {
          "id": 1,
          "first_name": "John",
          "last_name": "Doe",
          "phone": "9876543210"
        }
      }
    }
    ```
  - **`401 Unauthorized`**:
    ```json
    {
      "status": "fail",
      "message": "Invalid token or token has expired. Please login again."
    }
    ```

---

### Logout Session
- **Endpoint:** `POST /api/v1/auth/logout`
- **Authentication:** Bearer token inside `Authorization` Header
- **Set-Cookie Header:**
  - `refreshToken=; Max-Age=0; Path=/; HttpOnly; SameSite=Strict; Secure` (Clears Cookie)
- **Response Examples:**
  - **`204 No Content`**

---

## 4. Testing Endpoints Using Postman

We have supplied a pre-configured Postman collection file:
[Authentication_Module_Postman_Collection.json](file:///c:/Users/mathu/Documents/sem5/Integrated-Career-And-Recruitment-Portal/backend/Authentication_Module_Postman_Collection.json)

### How to Use the Postman Collection:
1. Open Postman.
2. Click **Import** at the top left.
3. Choose the [Authentication_Module_Postman_Collection.json](file:///c:/Users/mathu/Documents/sem5/Integrated-Career-And-Recruitment-Portal/backend/Authentication_Module_Postman_Collection.json) file.
4. Set up an Environment or verify collection variable defaults (`baseUrl` points to `http://localhost:5000`).
5. Run requests in folder order:
   - **System Health:** Execute health check.
   - **Register Student/Employer:** Creates user tables entries.
   - **Check Mail:** Copy the verification token from your SMTP inbox.
   - **Verify Email:** Send the verification payload to enable account login.
   - **Login User:** Captures the resulting JWT `token` and automatically saves it as environment variable `accessToken` for subsequent requests!
   - **Get Current User Details (Me):** Uses the `{{accessToken}}` authorization variable.
   - **Logout / Token Rotations:** Test JWT session expirations and cookies cleanup.
