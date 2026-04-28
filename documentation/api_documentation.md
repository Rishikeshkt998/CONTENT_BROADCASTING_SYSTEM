# Content Broadcasting System API Documentation

**Base URL:** `https://api-content-broadcasting-system.onrender.com`

---

## 🛡️ Security

### 1. Nonce Validation
To prevent replay attacks, certain endpoints (if enabled) require a unique nonce.

- **Header:** `x-nonce` (or `nonce` in request body)
- **Format:** `[unique-string]-[timestamp-in-base36]`
  - Example: `abc123xyz-lu3v5j8`
- **Rules:**
  - Nonces are valid for **5 minutes** from the timestamp.
  - Each nonce can only be used **once** for the same request signature (method + path + query + body).
- **Error Codes:**
  - `4001 (MissingNonce)`
  - `4002 (InvalidNonceFormat)`
  - `4003 (NonceExpired)`
  - `4004 (NonceAlreadyUsed)`

### 2. Rate Limiting
Global rate limiting is applied to all endpoints to prevent abuse.

- **Limit:** 100 requests per 15 minutes (default).
- **Headers Returned:**
  - `RateLimit-Limit`: Maximum requests allowed in the window.
  - `RateLimit-Remaining`: Requests remaining in the current window.
  - `RateLimit-Reset`: Time when the limit resets.
- **Error Code:** `429 (RateLimitExceeded)`

---

## 🔐 Authentication

### 1. Login
Authenticates a user and returns a JWT token.

- **URL:** `/api/auth/login`
- **Method:** `POST`
- **Body:**
  ```json
  {
    "email": "user@example.com",
    "password": "yourpassword"
  }
  ```
- **Response (Success):** `200 OK`
  ```json
  {
    "status": true,
    "message": "Login successful",
    "data": {
      "token": "JWT_TOKEN_HERE",
      "user": {
        "id": "user-uuid",
        "name": "John Doe",
        "email": "user@example.com",
        "role": "teacher"
      }
    }
  }
  ```

---

### 2. Register
Creates a new user account.

- **URL:** `/api/auth/register`
- **Method:** `POST`
- **Body:**
  ```json
  {
    "name": "John Doe",
    "email": "user@example.com",
    "password": "yourpassword",
    "role": "teacher"
  }
  ```
- **Response (Success):** `201 Created`
  ```json
  {
    "status": true,
    "message": "User registered successfully",
    "data": {
      "user": {
        "id": "user-uuid",
        "name": "John Doe",
        "email": "user@example.com",
        "role": "teacher"
      }
    }
  }
  ```

---

## 📺 Content Management

### 1. Upload Content
Uploads new content for broadcasting. (Requires `teacher` role)

- **URL:** `/api/content`
- **Method:** `POST`
- **Headers:** `Authorization: Bearer <token>`
- **Body:**
  ```json
  {
    "title": "Math Lesson 1",
    "subject": "Mathematics",
    "description": "Introduction to Algebra",
    "start_time": "2024-04-28T09:00:00Z",
    "end_time": "2024-04-28T10:00:00Z",
    "rotation_duration": 60,
    "file": "data:image/png;base64,..." 
  }
  ```
- **Response (Success):** `201 Created`

---

### 2. Get Content List
Fetches content list based on user role.

- **URL:** `/api/content`
- **Method:** `GET`
- **Headers:** `Authorization: Bearer <token>`
- **Response (Success):** `200 OK`

---

### 3. Approve Content
Approves a content for broadcasting. (Requires `principal` role)

- **URL:** `/api/content/:id/approve`
- **Method:** `PATCH`
- **Path Parameters:**
  - `id`: The unique UUID of the content record.
- **Headers:** `Authorization: Bearer <token>`
- **Response (Success):** `200 OK`

---

### 4. Reject Content
Rejects content with a reason. (Requires `principal` role)

- **URL:** `/api/content/:id/reject`
- **Method:** `PATCH`
- **Path Parameters:**
  - `id`: The unique UUID of the content record.
- **Headers:** `Authorization: Bearer <token>`
- **Body:**
  ```json
  {
    "reason": "Inappropriate content"
  }
  ```
- **Response (Success):** `200 OK`

---

### 5. Get Live Content (Public)
Fetches currently active approved content for a specific teacher.

- **URL:** `/api/content/live/:teacherId`
- **Method:** `GET`
- **Path Parameters:**
  - `teacherId`: The UUID of the teacher whose content should be displayed.
- **Query Params:** `subject` (optional)
- **Response (Success):** `200 OK`

---

## 📅 Scheduling & Rotation

The system automatically manages which content is "Live" based on predefined schedules and rotation rules.

### 1. Scheduling Rules
Content is only considered for live broadcasting if:
- **Status:** The content has been **APPROVED** by a Principal.
- **Time Window:** The current server time is between the content's `start_time` and `end_time`.
- **Subject/Teacher Match:** The content matches the requested `teacherId` and optional `subject`.

### 2. Subject-Based Rotation
If multiple approved items are active for the same subject simultaneously, the system performs a deterministic rotation:
- **Duration:** Each item uses its `rotation_duration` (in minutes) to determine its "slot" in the cycle.
- **Default:** If no duration is specified, it defaults to **5 minutes**.
- **Deterministic Logic:** The system calculates the current active item based on a global cycle (`CurrentTime % TotalSubjectDuration`), ensuring all clients see the same content at the same time.

---

## ❌ Error Handling

The API uses standard HTTP status codes and a consistent error response structure.

### Validation Error (Example)
When input validation fails (using Yup schemas), the response will include specific `errorDetails`.

- **Status Code:** `12 (PayloadError)` / `400 Bad Request`
- **Response:**
  ```json
  {
    "status": false,
    "msg": "Invalid Payload",
    "errorDetails": [
      "email is a required field",
      "password must be at least 6 characters"
    ],
    "useCase": "AUTHENTICATION_ERROR"
  }
  ```

### Authentication Error
- **Status Code:** `401 Unauthorized`
- **Response:**
  ```json
  {
    "status": false,
    "msg": "Invalid credentials",
    "useCase": "AUTHENTICATION_ERROR"
  }
  ```
