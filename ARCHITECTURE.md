# 🏛️ System Architecture - Content Broadcasting System

This document outlines the architectural decisions and design patterns used in the Content Broadcasting System.

---

## 1. 📂 Project Structure (Clean Architecture)
The project follows **Clean Architecture** principles to ensure separation of concerns and high testability.

```text
src/
├── domain/         # Core business entities & Enums
├── useCases/       # Orchestrates the flow of data
├── engines/        # Core business logic (Scheduling Algorithms)
├── controllers/    # Interface adapters (Express)
├── repositories/   # Data access layer (PostgreSQL/GraphQL)
├── infrastructure/ # WebServer, Middleware, DI Registry
└── index.ts        # Entry point
```

---

## 2. 🔐 Authentication & RBAC
- **JWT (JSON Web Tokens)**: Used for stateless authentication.
- **RBAC**: Implemented via an `authorizeRole` middleware.
  - **Teachers**: Can upload content and view their own status.
  - **Principals**: Can see all pending content and approve/reject them.

---

## 3. 📅 Scheduling & Rotation Logic (CRITICAL)
Instead of using brittle background "cron jobs" to update state, we use a **Stateless Dynamic Rotation Algorithm**.

### The Logic:
1. **Filter**: Fetch all `APPROVED` content where `start_time <= NOW <= end_time`.
2. **Cycle**: Calculate the total duration of all active items for a subject.
3. **Offset**: Calculate `CurrentTime % TotalDuration`.
4. **Result**: Serve the specific item that falls into that time slice.

**Benefit**: This ensures a perfectly synchronized "looping" experience for all students without any database write overhead or lag.

---

## 🚀 4. Scalability & Performance
- **Redis Caching**: The public broadcasting API results are cached in Redis to handle high traffic from students.
- **Stateless Design**: Since rotation is calculated dynamically, the system can scale horizontally (multiple servers) without complex syncing.
- **S3 Storage**: Abstracted file storage allows switching from local `uploads/` to AWS S3 by changing a single `.env` variable.

---

## 🛠️ 5. Middleware Usage
- **Rate Limiting**: Custom middleware to prevent DDoS and brute-force attacks.
- **Nonce Validation**: Protects state-changing operations against Replay Attacks.
- **Multer**: Handles multipart form data for image uploads with validation.

---

## 📊 6. Database Decisions
- **PostgreSQL**: Chosen for its robust UUID support and complex query capabilities.
- **Soft Filtering**: Content is never "deleted"; it simply moves through `pending -> approved/rejected` states, ensuring a full audit trail for the Principal.
