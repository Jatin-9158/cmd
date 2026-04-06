# Finance API - Express.js Version

Converted from original Go/Gin version. Uses same SQLite DB (`finance.db`), same routes, auth, roles.

## Setup

1. Copy `.env.example` to `.env` and set secrets:
   ```
   cp .env.example .env
   ```
   Edit `.env`: set `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET` (min 32 chars each).

2. Install dependencies:
   ```
   npm install
   ```

3. Run migrations (safe with existing finance.db):
   ```
   npx knex migrate:latest
   ```

4. Start server:
   ```
   npm start
   ```
   Or dev mode: `npm run dev`

Server runs on `http://localhost:8080`. Test `/health`.

## Routes (same as Go)

- `POST /api/v1/auth/register` - {email, password}
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/refresh`
- `POST /api/v1/auth/logout` (requires Bearer token)
- `GET /api/v1/users` (admin)
- `GET /api/v1/records` (viewer+)
- `POST /api/v1/records` (analyst+)
- `GET/POST /api/v1/dashboard/*` (analyst+)

## Notes
- Uses existing `finance.db` - no data loss.
- JWT auth with refresh tokens stored hashed.
- Roles: viewer (read records), analyst (create records + dashboard), admin (full).
- Logging to console/error.log/combined.log.
- Validation with Joi, errors structured.

Original Go version in `../api/` untouched.
