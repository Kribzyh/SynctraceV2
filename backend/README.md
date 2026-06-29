# SyncTrace Backend

Backend service for SyncTrace, built with Node.js, TypeScript, Express, Prisma, PostgreSQL, Redis, MinIO, Passport Google OAuth, and JWT.

## Prerequisites

- Node.js 20
- Docker Desktop
- npm

## Setup

1. Clone the repository.
2. Install dependencies:

   ```bash
   npm install
   ```

3. Copy the environment template and fill in your local values:

   ```bash
   copy .env.example .env
   ```

4. Start the local services:

   ```bash
   docker compose up -d
   ```

   This starts:
   - PostgreSQL with the pgvector-enabled image
   - Redis
   - MinIO

5. Apply the database migrations:

   ```bash
   npx prisma migrate dev
   ```

6. Start the backend:

   ```bash
   npm run dev
   ```

## Environment Variables

Populate these in `.env`.

| Variable | Description |
| --- | --- |
| `NODE_ENV` | Runtime mode used by the app and error handling. |
| `PORT` | HTTP port for the Express server. |
| `DATABASE_URL` | PostgreSQL connection string used by Prisma. |
| `REDIS_URL` | Redis connection string for background jobs and caching. |
| `JWT_SECRET` | Secret used to sign and verify JWT access tokens. |
| `JWT_EXPIRES_IN` | JWT lifetime, such as `7d`. |
| `COOKIE_NAME` | Name of the httpOnly auth cookie. |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID from Google Cloud. |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret from Google Cloud. |
| `GOOGLE_REDIRECT_URI` | Google OAuth callback URL registered in Google Cloud. |
| `MINIO_ENDPOINT` | Hostname for the MinIO object-storage server. |
| `MINIO_PORT` | Port for the MinIO object-storage server. |
| `MINIO_ACCESS_KEY` | Access key for the local MinIO instance. |
| `MINIO_SECRET_KEY` | Secret key for the local MinIO instance. |
| `MINIO_BUCKET` | Bucket name used for uploaded artifacts and exports. |
| `CORS_ORIGIN` | Allowed browser origin for the frontend during local development. |

## Google OAuth Setup

`GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` must come from a Google Cloud project configured with the OAuth consent screen set to External audience.

This app is currently intended to run in Testing mode. That means only accounts explicitly added as test users in Google Cloud can sign in.

The redirect URI registered in Google Cloud must exactly match `GOOGLE_REDIRECT_URI` in `.env`. For local development, the current callback is:

```text
http://localhost:4000/api/auth/google/callback
```

If the URI differs by even one character, Google OAuth will reject the callback.

## Current Implementation Status

- Step 1: Scaffold complete. TypeScript, ESLint, Express shell, and Docker Compose are in place.
- Step 2: Prisma schema plus pgvector migration complete and verified live against the database.
- Step 3: Google OAuth, JWT auth, RBAC middleware, and audit logging complete and verified end-to-end with a real Google account.
- Steps 4 and beyond: Not started yet. Project workspace, artifact ingestion, traceability, gaps, diagnostics, alignment, dashboards, and export still remain.

## Known Design Notes

Auth is currently implemented as stateless JWT authentication. Logout clears the client-side cookie/token, but there is no server-side session store or token revocation list yet.

That means an already-issued token remains valid until it naturally expires after 7 days, even if the user logs out. This is an intentional simplification for this stage, not a bug.

A Redis denylist or similar token-revocation mechanism would be a reasonable future improvement, but it is not a current requirement.