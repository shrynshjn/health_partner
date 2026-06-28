# Health Partner — Server

A NestJS REST API + MCP server for personal health tracking. Stores food, workouts, sleep, water, physical measurements, lab results, and goals in MongoDB. Exposes all data as MCP tools so Claude can read and write health records directly via a remote connector.

---

## Stack

| Concern | Choice |
|---|---|
| Framework | NestJS 10 (Express adapter) |
| Language | TypeScript 5 |
| Database | MongoDB via Mongoose 8 |
| Auth | JWT (Passport + `@nestjs/jwt`) |
| File storage | AWS S3 (`@aws-sdk/client-s3`) |
| MCP | `@modelcontextprotocol/sdk` — Streamable HTTP transport |
| Tests | Jest + ts-jest + `@nestjs/testing` (57 unit tests, zero real DB) |

---

## Project structure

```
src/
  main.ts                        # Bootstrap, global prefix, Swagger
  app.module.ts                  # Root module
  common/
    guards/jwt-auth.guard.ts
    decorators/user.decorator.ts  # Extracts { userId, email } from JWT
    middleware/logger.middleware.ts
  modules/
    auth/         POST /api/auth/register  POST /api/auth/login
    user/         user schema (no public routes)
    food/         CRUD + bulk  /api/food
    workout/      CRUD + bulk  /api/workout
    water/        CRUD         /api/water
    sleep/        CRUD         /api/sleep
    health/       lab values   /api/health
    physical/     measurements /api/physical
    goals/        GET + PUT    /api/goals
    media/        S3 upload    /api/media/upload
    daily-summary/             /api/daily-summary
    daily-activity/            /api/daily-activity
    misc/                      /api/misc/time_now  /api/privacy
    oauth/        OAuth 2.0 server  /.well-known/…  /oauth/…
    mcp/          MCP endpoint      /mcp
```

---

## Running locally

```bash
npm install
# create .env (see Environment Variables below)
npm run start:dev   # ts-node-dev with hot reload
npm run build       # compile to dist/
npm run test        # 57 unit tests, no DB needed
```

Swagger UI: `http://localhost:3000/api-docs`

---

## Environment variables

```env
PORT=3000
MONGO_URI=mongodb://localhost:27017/health_partner
JWT_SECRET=your_secret_here
JWT_EXPIRES_IN=7d
AWS_REGION=ap-south-1
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_S3_BUCKET=your-bucket
APP_URL=http://localhost:3000   # used in OAuth metadata discovery
```

---

## Authentication

All `/api/*` routes require `Authorization: Bearer <JWT>`.

```
POST /api/auth/register
  Body: { first_name, last_name, email, password, dob? }
  Returns: { access_token }

POST /api/auth/login
  Body: { email, password }
  Returns: { access_token }
```

JWT payload: `{ sub: userId (MongoDB ObjectId string), email }`.

---

## API reference

Global prefix: `/api`. All endpoints require Bearer JWT unless noted.

### Food  `/api/food`

```
POST   /api/food
  Body: { name, qty, unit, calories, protein, carbs, fats, eatTime (ISO8601),
          mealType? (breakfast|lunch|dinner|snack),
          user_input?, fibre?, calcium?, iron?, zinc?, magnesium?,
          cholesterol?, sodium?, potassium?, vitaminD?, vitaminB12?, omega3?,
          media?[], naturalText?, source?, idempotencyKey? }
  Returns: { message, foodId, createdAt }

POST   /api/food/bulk
  Body: { items: [Food], idempotencyKey? }
  Returns: { message, ids[], count }

GET    /api/food
  Query: start (ISO), end (ISO), mealType?, limit?, cursor?
  Returns: { items[], nextCursor }

PATCH  /api/food/:id       — partial update
DELETE /api/food/:id       — soft delete (sets deletedAt)
```

### Workout  `/api/workout`

```
POST   /api/workout
  Body: { name, type (yoga|running|walking|cycling|gym), startTime (ISO),
          duration (ms), calories, endTime?, intensity? (low|medium|high),
          location? (indoor|outdoor|gym), description?, avgHeartRate?,
          media?[], naturalText?, source?, idempotencyKey? }
  Returns: { message, workoutId, createdAt }

POST   /api/workout/bulk
GET    /api/workout        Query: start, end, limit?, cursor?
PATCH  /api/workout/:id
DELETE /api/workout/:id
```

### Water  `/api/water`

```
POST   /api/water
  Body: { qty (ml), drankAt (ISO), source?, media?[], naturalText?, idempotencyKey? }
  Returns: { message, waterId, createdAt }

GET    /api/water          Query: start, end, limit?, cursor?
PATCH  /api/water/:id
DELETE /api/water/:id
```

### Sleep  `/api/sleep`

```
POST   /api/sleep
  Body: { startTime (ISO), endTime (ISO), duration (ms),
          source?, media?[], naturalText?, idempotencyKey? }
  Returns: { message, sleepId, createdAt }

GET    /api/sleep          Query: start, end, limit?, cursor?
PATCH  /api/sleep/:id
DELETE /api/sleep/:id
```

### Health (lab values)  `/api/health`

```
POST   /api/health
  Body: { name, value, refMin, refMax, isOkay (bool), reportTime (ISO),
          unit?, category?, reportLink?, idempotencyKey? }
  Returns: { message, paramId, createdAt }

POST   /api/health/bulk
  Body: { items: [HealthParam], idempotencyKey? }

GET    /api/health/list           — returns distinct parameter names for this user
GET    /api/health/:name          — latest value for that parameter
GET    /api/health/trends/all     — Query: names[], start, end, interval (day|week|month)
```

### Physical  `/api/physical`

```
POST   /api/physical
  Body: { type (weight|height|bodyFat|waist|hip|quads|chest|biceps|calves|
                  muscleMass|bmi|bmr|boneMass|metabolicAge|skeletalMuscle|
                  subcutaneousFat|visceralFat),
          value, measuredAt (ISO), source?, media?[], idempotencyKey? }
  Returns: { message, paramId, createdAt }

POST   /api/physical/bulk
GET    /api/physical/:type        — latest value for that type
PATCH  /api/physical/latest/:type — update the latest record
DELETE /api/physical/latest/:type — soft delete the latest record
GET    /api/physical/trends/all   — Query: types[], start, end, interval
```

### Goals  `/api/goals`

```
GET  /api/goals
  Returns: { goals: [{ parameter, type (min|max|target), target, unit? }], updatedAt }

PUT  /api/goals
  Body: { goals: [{ parameter, type, target, unit? }] }
  Returns: { message, updated, updatedAt, goals[] }
```

### Daily Summary  `/api/daily-summary`

```
GET  /api/daily-summary
  Query: start (ISO), end (ISO)
  Returns: [{ day, metrics: [{ parameter, goal, value, achieved }], score (0–100) }]
  Note: generates summaries on-the-fly for days without a cached record.
        Requires at least one goal to be set for a user.
```

### Daily Activity  `/api/daily-activity`

```
POST /api/daily-activity
  Body: { date (ISO), steps, activeMinutes, ... }

GET  /api/daily-activity
  Query: start, end
```

### Media  `/api/media`

```
POST /api/media/upload
  multipart/form-data: file (binary), type (food|workout|sleep|water|report)
  Returns: { url (S3 CDN URL), mimeType, size }
```

### Misc

```
GET /api/misc/time_now   — returns current server time (no auth)
GET /api/privacy         — privacy policy text (no auth)
```

---

## MCP + OAuth 2.0

The server is a self-contained OAuth 2.0 authorization server AND an MCP server. Claude connects to `/mcp` as a remote connector and goes through OAuth to authenticate as a specific user.

### OAuth endpoints (no `/api` prefix, no auth required)

```
GET  /.well-known/oauth-authorization-server
  Returns issuer, authorization_endpoint, token_endpoint, supported grants/challenges

GET  /oauth/authorize?client_id=…&redirect_uri=…&response_type=code&state=…
  Serves a plain HTML login page (email + password form).

POST /oauth/authorize
  Body (form): email, password, redirect_uri, state, code_challenge?, code_challenge_method?
  Validates credentials via AuthService.login(), stores a short-lived auth code (5 min TTL,
  in-memory Map), redirects to redirect_uri?code=<hex>&state=<state>.

POST /oauth/token
  Body: grant_type=authorization_code, code, redirect_uri
  Exchanges code for JWT access token.
  Returns: { access_token, token_type: "Bearer", expires_in: 604800 }
```

### MCP endpoint

```
GET | POST  /mcp
  Authorization: Bearer <JWT>   (obtained via OAuth flow above)

  Returns 401 with WWW-Authenticate header if token missing/invalid.
  On valid token: creates a fresh McpServer scoped to the authenticated userId,
  connects a StreamableHTTPServerTransport, and handles the MCP request.
```

### MCP tools (all scoped to the authenticated user — no userId param needed)

| Tool | Description |
|---|---|
| `log_food` | Log a food entry (name, qty, unit, macros, eatTime, mealType?) |
| `get_food_logs` | Retrieve food logs for a date range |
| `log_workout` | Log a workout (name, type, startTime, duration ms, calories) |
| `get_workouts` | Retrieve workouts for a date range |
| `log_water` | Log water intake (qty ml, drankAt) |
| `log_sleep` | Log sleep (startTime, endTime, duration ms) |
| `get_daily_summary` | Get daily health scores and goal progress for a date range |
| `log_health_metric` | Log a lab result (name, value, refMin, refMax, isOkay, reportTime) |
| `log_physical` | Log a physical measurement (type, value, measuredAt) |
| `get_goals` | Get the user's current health goals |

### Connecting Claude

1. In Claude Desktop or claude.ai, add a remote MCP connector with URL `https://your-server/mcp`.
2. Claude will fetch `/.well-known/oauth-authorization-server` to discover auth endpoints.
3. Claude opens a browser to `/oauth/authorize` — user signs in with their Health Partner credentials.
4. After login, Claude receives an access token and connects to `/mcp`.

---

## Data conventions

- **Timestamps**: all datetime fields accept/return ISO 8601 strings. Durations are in **milliseconds**.
- **Pagination**: cursor-based. Pass `cursor` (last item `_id`) and `limit` to GET endpoints. Response includes `nextCursor` (null when no more pages).
- **Soft deletes**: DELETE endpoints set `deletedAt`; records are excluded from GET queries.
- **Idempotency**: pass `idempotencyKey` in POST body to prevent duplicate writes on retry.
- **userId**: MongoDB ObjectId stored as string in JWT `sub` claim. Services convert to `Types.ObjectId` internally.

---

## Error format

NestJS built-in exception filter — responses follow:

```json
{
  "statusCode": 400,
  "message": "human readable string or array of validation errors",
  "error": "Bad Request"
}
```

Common codes: `400` validation, `401` missing/expired token, `404` not found, `409` conflict, `500` server error.

---

## Tests

```bash
npm test           # run all 57 unit tests
npm run test:watch # watch mode
npm run test:cov   # with coverage report
```

Tests use `@nestjs/testing` with mocked Mongoose models — no real DB connection required. Coverage spans: all service CRUD logic, auth flows, OAuth code flow (including code reuse/mismatch/expiry), MCP controller auth, and MCP server tool registration.
