# Content Broadcasting System

A Node.js backend application designed to allow teachers to broadcast educational content (like question papers and announcements) directly to students' devices. The system supports full Authentication & RBAC, Approval Workflows, and an advanced dynamic Scheduling and Rotation engine.

## Tech Stack
- **Architecture:** Clean Architecture
- **Dependency Injection:** Awilix
- **Backend Framework:** Node.js, Express
- **Database:** PostgreSQL
- **GraphQL Layer:** PostGraphile
- **Authentication:** JWT (JSON Web Tokens), bcrypt
- **File Uploads:** Multer (Local Storage)
- **Language:** TypeScript

## Setup Steps

1. **Prerequisites**
   - Node.js (v18+ recommended)
   - PostgreSQL installed and running

2. **Clone the Repository**
   ```bash
   git clone <your-repo-link>
   cd content-broadcasting-system
   ```

3. **Install Dependencies**
   ```bash
   npm install
   ```

4. **Environment Variables**
   Create a `.env` file in the root directory:
   ```env
   PORT=3000
   GRAPHQL_PORT=4000
   DATABASE_URL=postgres://username:password@localhost:5432/broadcasting_db
   JWT_SECRET=your_super_secret_key
   
   # Storage Configuration
   STORAGE_TYPE=local # or 's3'
   S3_ACCESS_KEY=your_access_key
   S3_SECRET_KEY=your_secret_key
   S3_REGION=us-east-1
   S3_BUCKET_NAME=your_bucket_name

   # Security Configuration
   ENABLE_SECURITY_MIDDLEWARES=true
   REDIS_URL=redis://localhost:6379
   RATE_LIMIT_WINDOW_MINUTES=15
   RATE_LIMIT_MAX_REQUESTS=100
   ```

5. **Database Setup**
   Run the `schema.sql` file in your PostgreSQL database to create the required tables and insert the dummy users:
   ```bash
   psql -U username -d broadcasting_db -f schema.sql
   ```

6. **Run the Application**
   ```bash
   # Development mode
   npm run dev
   
   # Production build
   npm run build
   npm start
   ```

## API Usage

### Auth Endpoints
- `POST /api/auth/login`
  - Body: `{ "email": "principal@school.com", "password": "password" }`
  - Returns: JWT Token

### Content Endpoints (Protected)
*Note: Pass the JWT token in the `Authorization: Bearer <token>` header.*

- `POST /api/content/` **(Teacher Only)**
  - Multipart/form-data:
    - `file`: (image/jpeg, png, gif)
    - `title`: string
    - `subject`: string
    - `description`: string (optional)
    - `start_time`: ISO DateTime
    - `end_time`: ISO DateTime
    - `rotation_duration`: number (in minutes)

- `GET /api/content` **(Principal & Teacher)**
  - Lists all content. Principals see everything, Teachers see their own.

- `PATCH /api/content/:id/approve` **(Principal Only)**
  - Approves the content.

- `PATCH /api/content/:id/reject` **(Principal Only)**
  - Body: `{ "reason": "Not relevant to syllabus" }`
  - Rejects the content.

### Public Broadcast API
- `GET /api/content/live/:teacherId`
  - Query Params (Optional): `?subject=Maths`
  - Evaluates active time windows and returns the dynamically rotating content for the students.

## GraphQL API
When `DATABASE_URL` is set, PostGraphile automatically generates a GraphQL endpoint at:
- `/graphql`
- GraphiQL UI is available at `/graphiql`

## Notes on Implementation
The rotation logic is implemented dynamically based on the current Unix timestamp modulo the total duration of active content. This completely eliminates the need for background cron jobs running continuous updates on the database, making the application highly performant and horizontally scalable.

State management is handled via an optimized integer-based `ContentStatus` enumeration, allowing strict type safety from the PostgreSQL database straight through to the TypeScript domain layer and GraphQL API.

The entire codebase strictly adheres to **Clean Architecture** principles. The business logic (`engines`), application workflows (`useCases`), and interface adapters (`controllers`, `repositories`) are fully decoupled. Dependency Injection is managed via **Awilix** in a proxy-based IOC container, making the system highly modular and unit-testable.

## Security Features
- **Rate Limiting:** Implemented via `express-rate-limit` with custom key generation (IP + UserAgent + Request Signature) to prevent brute-force and DDoS attacks.
- **Nonce Validation:** Replay attack protection using a one-time-use token (Nonce) for state-changing requests, backed by **Redis** for distributed tracking.
- **RBAC:** Strict Role-Based Access Control enforcing Teacher and Principal permissions.

## Storage Management
- **Hybrid Storage:** Supports both local filesystem and **AWS S3** / DigitalOcean Spaces.
- **Dynamic Switching:** Switch between `local` and `s3` via the `STORAGE_TYPE` environment variable.
- **Signed URLs:** Content retrieval is protected via pre-signed URLs when using S3 storage.
