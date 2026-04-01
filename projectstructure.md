# Mono-service Project Blueprint (Prompt + Structure)

Use this as a **prompt/instructions** to generate a new **Node.js (Express) mono-service** that follows the same patterns as this repo’s services (middleware ordering, controllers/services/models split, centralized error handling, requestId logging, health checks, Joi validation, auth middleware, and PM2 process management).

---

## Prompt (copy/paste into your project generator / AI)

Build a Node.js (>=18) Express mono-service using CommonJS (`require/module.exports`) with the following constraints:

- Follow this exact folder/file structure.
- Use MongoDB via Mongoose.
- Provide centralized error handling with `asyncHandler` wrapper and a global error middleware.
- Implement Joi request validation middleware.
- Implement JWT authentication middleware (`Authorization: Bearer <token>`).
- Provide requestId middleware and request logging.
- Provide `/health`, `/health/ready`, `/health/live` endpoints.
- Use **only HTTP status codes `200`, `400`, `500`** in API responses (even for auth/not-found cases).
- Provide PM2 `ecosystem.config.js` and npm scripts to run via PM2.
- Add `.env.example` with all required environment variables.

Output:
- All source code files.
- `README.md` with setup/run steps.
- Minimal tests scaffold (optional but preferred).

---

## Target directory structure

```
mono-service/
├── app.js
├── server.js
├── package.json
├── .env.example
├── ecosystem.config.js
├── config/
│   ├── dev.js
│   └── database.js
├── controller/
│   └── <resource>Controller.js
├── middleware/
│   ├── auth.js
│   ├── database.js
│   ├── errorHandler.js
│   ├── healthCheck.js
│   ├── requestLogger.js
│   └── validation.js
├── models/
│   └── <Resource>.js
├── routes/
│   └── <resource>Routes.js
├── services/
│   └── <resource>Service.js
├── utils/
│   ├── httpClient.js
│   └── counter.js
├── validation/
│   └── <resource>Validation.js
└── __tests__/
    └── <resource>.test.js
```

Notes:
- Keep request handling in `controller/`, business logic in `services/`, DB schemas in `models/`.
- Joi schemas live in `validation/`; middleware wrappers live in `middleware/validation.js`.

---

## Boot sequence + middleware ordering (must match)

In `app.js`, set up middleware in this general order (matching existing services like `services/sales/app.js`):

1. `dotenv` load with explicit path (service-local `.env`)
2. `helmet`, `cors`, optional `express-rate-limit`
3. `express.json` / `express.urlencoded` body parsers
4. `generateRequestId`
5. `securityHeaders`
6. `requestTimeout(30000)`
7. `performanceMonitor`
8. `morgan('dev')` in development
9. `requestLogger`
10. Health routes
11. API routes
12. Not-found handler (respond **400** per status-code rule)
13. `errorLogger`
14. `globalErrorHandler` (respond **400/500** only)

`server.js` should import the `app`, connect DB, start listening, and implement graceful shutdown (SIGTERM/SIGINT).

---

## Error handling contract

### Response shape

All error responses should be JSON:

```json
{
  "success": false,
  "message": "Human readable message",
  "error": "MACHINE_CODE_OPTIONAL",
  "details": [],
  "requestId": "uuid",
  "timestamp": "ISO-8601"
}
```

### Status code rule

Use only:
- `200` for success
- `400` for validation/business/auth/not-found style errors
- `500` for unexpected server errors

### Middleware requirements (`middleware/errorHandler.js`)

Implement:
- `asyncHandler(fn)` wrapper: `Promise.resolve(fn(req,res,next)).catch(next)`
- Custom error classes or an `ErrorHandler` factory (either style is fine, but be consistent)
- `notFoundHandler` that returns **400** (not 404) with a friendly message
- `globalErrorHandler` that:
  - logs with `requestId`
  - maps Mongoose `ValidationError`, `CastError`, duplicate key (`11000`) into **400**
  - maps JWT errors into **400**
  - returns **500** only for untrusted/unexpected errors

---

## Joi validation

Create Joi schemas in `validation/<resource>Validation.js` and middleware in `middleware/validation.js` like:

- `validateBody(schema)`
- `validateQuery(schema)`
- `validateParams(schema)`

Behavior:
- On validation error, throw or `next()` an operational validation error that becomes an HTTP **400**.
- Include a normalized `details` array: `{ field, message, value }`.

---

## Authentication middleware (`middleware/auth.js`)

Requirements:
- Read `Authorization` header
- Verify JWT using `JWT_SECRET`
- Attach `req.user` and a stable `req.user._id`/`referenceId` style field (match the conventions used in existing services)
- On missing/invalid/expired token, respond as **400** (per status-code rule) with a consistent JSON shape and `requestId`

---

## Health checks (`middleware/healthCheck.js`)

Expose:
- `GET /health` (basic OK)
- `GET /health/ready` (DB connectivity + optional dependencies)
- `GET /health/live` (process is up)

All should respond with `200` and include service name/version, uptime, and timestamp.

---

## PM2 setup

### `ecosystem.config.js`

Provide a PM2 app definition:
- `name`: service name
- `script`: `server.js`
- `instances`: `1` (or configurable)
- `exec_mode`: `fork` (or cluster if explicitly needed)
- `env`: sets `NODE_ENV=development`
- `env_production`: sets `NODE_ENV=production`

### `package.json` scripts

Include scripts aligned with this repo’s root style:
- `start`: `node server.js`
- `start:dev`: `pm2 start ecosystem.config.js --env development`
- `start:prod`: `pm2 start ecosystem.config.js --env production`
- `stop`: `pm2 stop <name>`
- `restart`: `pm2 restart <name>`
- `logs`: `pm2 logs <name>`
- `status`: `pm2 status`

---

## Environment variables (`.env.example`)

Include at least:

```
NODE_ENV=development
PORT=5000

MONGODB_URI=mongodb://localhost:27017/<db-name>

JWT_SECRET=change-me
JWT_EXPIRES_IN=24h

FRONTEND_URL=http://localhost:3000
REQUEST_SIZE_LIMIT=10mb

RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

---

## Minimal example endpoints

Provide one resource end-to-end (example: `items`):

- `POST /items` (auth + Joi body validation)
- `GET /items` (auth + Joi query validation)
- `GET /items/:id` (auth + Joi param validation)
- `PUT /items/:id` (auth + Joi validations)
- `DELETE /items/:id` (auth)

All success responses should use `200` and a consistent shape:

```json
{ "success": true, "message": "…", "data": {}, "requestId": "…", "timestamp": "…" }
```

---

## Implementation checklist (generator must satisfy)

- [ ] Folder structure exactly as specified
- [ ] `app.js` wires middleware in the specified order
- [ ] `server.js` handles DB connect + graceful shutdown
- [ ] Joi validation middleware exists and is used on routes
- [ ] Auth middleware exists and is used on protected routes
- [ ] Central error middleware exists with `asyncHandler`
- [ ] Only `200/400/500` status codes in API responses
- [ ] PM2 `ecosystem.config.js` + scripts in `package.json`
- [ ] `.env.example` present

