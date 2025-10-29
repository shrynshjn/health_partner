# Health Partner — Backend

Health Partner is a TypeScript backend that provides the data store and APIs for a personal health partner. The backend is designed to be consumed by an AI frontend plugin (e.g., a custom GPT) which handles natural-language / image input, conversation, and guided data collection. The AI frontend uses these APIs to persist user logs, fetch historical data, calculate summaries and trends, and provide suggestions.

This README documents the purpose, data models, API surface, conventions (errors, idempotency), and developer setup.

Table of contents
- [Key ideas](#key-ideas)
- [Features](#features)
- [Architecture & integration pattern](#architecture--integration-pattern)
- [Authentication & headers](#authentication--headers)
- [Data models & indexes (overview)](#data-models--indexes-overview)
- [API reference (summary)](#api-reference-summary)
  - [Media API](#media-api)
  - [Goals API](#goals-api)
  - [Food API](#food-api)
  - [Workout API](#workout-api)
  - [Sleep API](#sleep-api)
  - [Water API](#water-api)
  - [Health Parameters API](#health-parameters-api)
  - [Physical Parameters API](#physical-parameters-api)
  - [Daily Summary API](#daily-summary-api)
- [Idempotency & deduplication](#idempotency--deduplication)
- [Error format & HTTP statuses](#error-format--http-statuses)
- [Getting started (dev)](#getting-started-dev)
- [Environment variables (example)](#environment-variables-example)
- [Common scripts](#common-scripts)
- [Testing, linting, and deployment notes](#testing-linting-and-deployment-notes)
- [Contributing](#contributing)
- [License & contact](#license--contact)

Key ideas
- Backend supplies a canonical source of truth for user health data (food, workouts, sleep, water, physical & lab parameters, goals, daily summaries).
- The AI frontend handles ambiguous input (text or image), asks clarifying questions, produces a final natural-language summary, and calls the backend to persist the confirmed log.
- All write endpoints support an optional Idempotency-Key to prevent duplicate writes from retries.
- Most deletes are soft-deletes (deletedAt timestamp).

Features
- CRUD endpoints for: food, workouts, sleep, water, physical parameters, health parameters, goals, media uploads, daily summaries.
- Bulk create endpoints for batch imports / report extraction.
- Trends and timeseries endpoints for charting and analysis.
- Authentication required on all endpoints.
- Standardized error payload and pagination/cursor support.

Architecture & integration pattern
- The AI plugin handles input parsing (OCR, image classification), user questioning, and final confirmation. After confirmation it:
  1. Uploads any media to the Media API (POST /api/media/upload).
  2. Calls the corresponding create endpoint (e.g., POST /api/food) with the final, validated payload and an optional Idempotency-Key.
  3. Optionally requests summaries/trends to present contextual advice.
- The backend is framework-agnostic in API design (examples assume Express/Nest/Next API style) and stores data in a document or relational database (models assume objectId-style identifiers).

Authentication & headers
- Authorization: Bearer <token> (JWT or API key) required for all endpoints.
- Content-Type: application/json for JSON endpoints. Use multipart/form-data for file upload endpoints.
- Optional: Idempotency-Key header or idempotencyKey body field for POST/PUT to prevent duplicate writes.
- Example headers:
  - Authorization: Bearer eyJ...
  - Content-Type: application/json
  - Idempotency-Key: 8d0f-9f1a-...

Data models & indexes (overview)
- User
  - first_name, last_name, dob, email
- Goals
  - userId, parameter, target, type (min|max|target), unit, updatedAt
- Daily Summary
  - userId, day (YYYY-MM-DD), metrics: [{ parameter, goal, value, achieved }], score (0-100)
- Food
  - user_input, name, qty, unit, source, calories, protein, carbs, fats, fibre, micronutrients..., eatTime, mealType, media[], naturalText, idempotencyKey, deletedAt
  - Index: { userId: 1, eatTime: -1 }
- Workout
  - user_input, name, type, startTime, duration (ms), endTime, calories, location, intensity, avgHeartRate, media[], naturalText, idempotencyKey, deletedAt
  - Index: { userId: 1, startTime: -1 }
- Sleep
  - userId, startTime, endTime, duration (ms), source, media[], naturalText, idempotencyKey, deletedAt
  - Index: { userId: 1, startTime: -1 }
- Water
  - userId, qty (ml), drankAt, source, media[], naturalText, idempotencyKey, deletedAt
  - Index: { userId: 1, drankAt: -1 }
- Health Parameter (lab values)
  - userId, name, value, refMin, refMax, isOkay, reportTime, reportLink, unit, category, idempotencyKey
  - Index: { userId: 1, name: 1, reportTime: -1 }
- Physical Parameter
  - userId, type (weight|height|bodyFat|waist|hip|quads|chest|biceps|calves), value, source, measuredAt, media[], idempotencyKey, deletedAt
  - Index: { userId: 1, type: 1, measuredAt: -1 }

API reference (summary)
Note: all endpoints require Authorization header unless noted.

Media API
- POST /api/media/upload
  - multipart/form-data: file (binary), type (food|workout|sleep|water|report)
  - Returns: { url, mimeType, size }

Goals API
- GET /api/goals
  - Returns user's goals array and updatedAt.
- PUT /api/goals
  - Body: { goals: [{ parameter, target, type, unit }], idempotencyKey? }
  - Upserts goals. Returns { message, updated, updatedAt }

Food API
- POST /api/food
  - Single food log. Required fields: name, qty, unit, source, calories, protein, carbs, fats, eatTime
  - Optional: user_input, fibre, micronutrients, media[], naturalText, idempotencyKey
  - Returns: { message, foodId, createdAt }
- POST /api/food/bulk
  - Bulk create: { items: [Food], idempotencyKey? }
  - Returns createdIds, count
- GET /api/food
  - Query: start (ISO), end (ISO), limit?, cursor?
  - Returns paginated foods between start (inclusive) and end (exclusive).
- PUT /api/food/:id
  - Update fields for a food log.
- DELETE /api/food/:id
  - Soft-delete: sets deletedAt.

Workout API
- POST /api/workout
  - Create a workout. Required: name, type, startTime, duration, source
- POST /api/workout/bulk
- GET /api/workout
  - Query: start, end, limit, cursor
- PUT /api/workout/:id
- DELETE /api/workout/:id

Sleep API
- POST /api/sleep
  - Required: startTime, endTime, duration, source
- PUT /api/sleep/:id
- GET /api/sleep
  - Query: start, end, limit, cursor
- DELETE /api/sleep/:id

Water API
- POST /api/water
  - Required: qty (ml), drankAt, source
- PUT /api/water/:id
- GET /api/water
  - Query: start, end, limit, cursor
- DELETE /api/water/:id

Health Parameters API (lab values)
- POST /api/health
  - Create a single parameter (name, value, refMin, refMax, isOkay, reportTime, unit, category, reportLink?, idempotencyKey?)
- POST /api/health/bulk
  - Use when extracting multiple params from a single report
- GET /api/health/:name
  - Returns the latest parameter value for that name
- GET /api/health/trends
  - Query: names[], start, end, interval (day|week|month)

Physical Parameters API
- POST /api/physical
  - Create a physical measurement (type, value, source, measuredAt, media[]).
- POST /api/physical/bulk
- GET /api/physical/:type
  - Latest value for type (weight, bodyFat, etc).
- GET /api/physical/trends
  - Query: types[], start, end, interval

Daily Summary API
- GET /api/summary/daily
  - Query: start (00:00 local), end (00:00), limit?, cursor?
  - Returns day-by-day summaries with score and metrics.

Idempotency & deduplication
- For any endpoint that creates or upserts records (POST/PUT), clients should include an idempotency key in header or body (Idempotency-Key / idempotencyKey) to avoid duplicates when retries happen.
- When a duplicate idempotencyKey is detected for the same user & endpoint, the server should return 409 Conflict or the original resource response.

Error format & HTTP statuses
Standard error JSON:
{
  "error": "invalid_input",
  "message": "Human readable message",
  "details": { /* field errors */ } | null,
  "requestId": "uuid",
  "status": 422,
  "timestamp": "2025-10-29T..."
}
Common statuses used: 200, 201, 202, 204, 400, 401, 403, 404, 409, 422, 429, 500.

Getting started (dev)
1. Clone:
   git clone https://github.com/shrynshjn/health_partner.git
   cd health_partner
2. Install:
   npm install
   or
   yarn
3. Configure environment (see next section) and start in dev:
   npm run dev
   or
   yarn dev
4. Build for production:
   npm run build
   npm start

Environment variables (example)
- NODE_ENV=development
- PORT=3000
- DATABASE_URL=postgresql://user:pass@localhost:5432/health_partner
- JWT_SECRET=your_jwt_secret
- REDIS_URL=redis://localhost:6379
- CDN_BUCKET_URL=https://cdn.example.com
- SENTRY_DSN=...
- ADDITIONAL: cloud storage keys, mailer settings for invites, etc.

Common scripts (update package.json to match)
- dev — run with hot reload (ts-node-dev / nodemon)
- build — tsc compile
- start — run built JS
- test — run unit & integration tests
- lint — eslint
- format — prettier
- migrate — run database migrations
- seed — seed DB for local dev

Testing, linting, and deployment notes
- Tests: use Jest or Vitest. Use an isolated test DB or in-memory DB (mongodb-memory-server or test Postgres).
- Lint & format: ESLint + Prettier recommended.
- Containerization: provide Dockerfile and docker-compose (optional) for DB and local env.
- Secrets: do not commit .env. Use a secrets manager or env injection in CI/CD.

Design notes & AI integration tips
- The AI frontend must perform the human-in-the-loop confirmation before sending a final create call. The backend trusts the confirmed payloads and stores them.
- For media uploads, prefer uploading first to CDN (Media API) and then include returned URLs in the log payload.
- Keep granular metrics (micronutrients, durations, calories) to allow the AI to compute budgets & make suggestions.
- Store both structured fields and a naturalText summary generated by the AI for auditability and easy presentation.
- Provide endpoints for trends and comparisons for the AI to fetch and summarise long-term behaviors (e.g., last 7 vs last 14 days).

Contributing
- Fork the repo, create a feature branch, add tests for any new behavior, and open a pull request with a clear description.
- Follow established linting/style and include changelog entries for significant changes.

License & contact
- Add a LICENSE file to this repo (e.g., MIT) as desired.
- Repo: https://github.com/shrynshjn/health_partner
- Maintainer: @shrynshjn
