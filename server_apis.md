# Server API Documentation

Base URL: `http://localhost:3000/api/v1`

## Health Check

### Check Server Health
**Endpoint:** `GET /health`

**Description:** Check if the server is running and healthy.

```bash
curl -X GET http://localhost:3010/api/v1/health
```

**Response:**
```json
{
  "success": true,
  "message": "Service is healthy",
  "data": {
    "status": "OK",
    "timestamp": "2023-12-30T10:00:00.000Z",
    "uptime": 123.456
  }
}
```

---

## Authentication APIs

### 1. Register with Password

**Endpoint:** `POST /auth/register`

**Description:** Register a new user with email and password. Email is automatically verified.

```bash
curl -X POST http://localhost:3011/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Registration successful",
  "data": {
    "message": "Registration successful"
  }
}
```

---

### 2. Register with OTP

**Endpoint:** `POST /auth/register`

**Description:** Register a new user with email only. An OTP will be sent for verification.

```bash
curl -X POST http://localhost:3011/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com"
  }'
```

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "OTP sent to your email",
  "data": {
    "message": "OTP sent to your email"
  }
}
```

---

### 3. Login with Password

**Endpoint:** `POST /auth/login`

**Description:** Login with email and password. Returns JWT token on success.

```bash
curl -X POST http://localhost:3011/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "uuid-here",
      "email": "user@example.com",
      "isEmailVerified": true,
      "status": "ACTIVE",
      "roles": ["USER"]
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

### 4. Request OTP for Login

**Endpoint:** `POST /auth/login-otp`

**Description:** Request an OTP to login via email.

```bash
curl -X POST http://localhost:3011/api/v1/auth/login-otp \
  -H "Content-Type: application/json" \
  -d '{
    "email": "dk@vnnogile.com"
  }'
```

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "If the email exists, an OTP has been sent",
  "data": {
    "message": "If the email exists, an OTP has been sent"
  }
}
```

---

### 5. Verify OTP

**Endpoint:** `POST /auth/verify-otp`

**Description:** Verify OTP for login or registration. Returns JWT token on success.

```bash
curl -X POST http://localhost:3011/api/v1/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{
    "email": "dk@vnnogile.com",
    "otp": "123456",
    "purpose": "LOGIN"
  }'
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "otp": "123456",
  "purpose": "LOGIN"
}
```

**Valid purposes:** `LOGIN`, `REGISTER`, `RESET_PASSWORD`

**Response:**
```json
{
  "success": true,
  "message": "OTP verified successfully",
  "data": {
    "user": {
      "id": "uuid-here",
      "email": "user@example.com",
      "isEmailVerified": true,
      "status": "ACTIVE",
      "roles": ["USER"]
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

### 6. Forgot Password

**Endpoint:** `POST /auth/forgot-password`

**Description:** Request an OTP for password reset.

```bash
curl -X POST http://localhost:3000/api/v1/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com"
  }'
```

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "If the email exists, a password reset OTP has been sent",
  "data": {
    "message": "If the email exists, a password reset OTP has been sent"
  }
}
```

---

### 7. Reset Password

**Endpoint:** `POST /auth/reset-password`

**Description:** Reset password using OTP.

```bash
curl -X POST http://localhost:3000/api/v1/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "otp": "123456",
    "newPassword": "newpassword123"
  }'
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "otp": "123456",
  "newPassword": "newpassword123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password reset successful",
  "data": {
    "message": "Password reset successful"
  }
}
```

---

## User APIs

### 8. Get Current User Profile

**Endpoint:** `GET /users/me`

**Description:** Get the authenticated user's profile. Requires JWT token.

```bash
curl -X GET http://localhost:3000/api/v1/users/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response:**
```json
{
  "success": true,
  "message": "User profile retrieved successfully",
  "data": {
    "id": "uuid-here",
    "email": "user@example.com",
    "isEmailVerified": true,
    "status": "ACTIVE",
    "roles": ["USER"],
    "createdAt": "2023-12-30T10:00:00.000Z",
    "updatedAt": "2023-12-30T10:00:00.000Z"
  }
}
```

---

## Error Responses

### Validation Error
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "path": "email",
      "message": "Invalid email address"
    }
  ]
}
```

### Authentication Error
```json
{
  "success": false,
  "message": "Invalid or expired token"
}
```

### General Error
```json
{
  "success": false,
  "message": "Error message here"
}
```

---

## Authentication Flow Examples

### Flow 1: Register and Login with Password

1. Register:
```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "password123"}'
```

2. Login:
```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "password123"}'
```

3. Access protected endpoint:
```bash
curl -X GET http://localhost:3000/api/v1/users/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

### Flow 2: Register with OTP

1. Register (no password):
```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com"}'
```

2. Verify OTP:
```bash
curl -X POST http://localhost:3000/api/v1/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "otp": "123456", "purpose": "REGISTER"}'
```

3. Access protected endpoint:
```bash
curl -X GET http://localhost:3000/api/v1/users/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

### Flow 3: Login with OTP

1. Request OTP:
```bash
curl -X POST http://localhost:3000/api/v1/auth/login-otp \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com"}'
```

2. Verify OTP:
```bash
curl -X POST http://localhost:3000/api/v1/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "otp": "123456", "purpose": "LOGIN"}'
```

---

### Flow 4: Password Reset

1. Request password reset:
```bash
curl -X POST http://localhost:3000/api/v1/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com"}'
```

2. Reset password with OTP:
```bash
curl -X POST http://localhost:3000/api/v1/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "otp": "123456", "newPassword": "newpassword123"}'
```

3. Login with new password:
```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "newpassword123"}'
```

---

## Notes

- All OTPs are valid for 5 minutes
- Password must be at least 8 characters long
- OTP must be exactly 6 digits
- JWT tokens expire after 7 days (configurable via `JWT_EXPIRES_IN` in .env)
- Protected endpoints require `Authorization: Bearer <token>` header
- Email addresses must be valid email format
