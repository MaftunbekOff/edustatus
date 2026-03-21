# Backend: Go + Rust + Nest (transitional)

## Architecture

- **`backend-go/` (Go)** — public API on port **3001**. Handles:
  - `/api/auth/*` (JWT, cookies, sessions, login history) — same DB as Prisma
  - `/api/health*` — aggregates **query-router** (Go), **Redis**, **shard-manager** (Rust), **`rust-health`** (Rust)
  - **All other `/api/*` routes** — reverse-proxied to **`backend-nest`** (NestJS), with `accessToken` cookie copied to `Authorization: Bearer` for compatibility

- **`backend/` (NestJS)** — **`backend-nest`** in Docker: runs **Prisma migrations** (`docker-entrypoint.sh`) and serves legacy controllers (clients, organizations, dashboard, …). Not published on the host; only reachable inside the compose network as `http://backend-nest:3001`.

- **`services/rust-health/` (Rust)** — minimal Axum service on **8083** with `GET /health`, included in the Go health JSON as `rust.rustHealth`.

- **Existing services** — `services/query-router` (Go), `services/shard-manager` (Rust) unchanged.

## Environment (Go gateway)

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | PostgreSQL (same DB as Nest) |
| `JWT_SECRET` | Must match Nest for proxied routes |
| `PROXY_FALLBACK_URL` | e.g. `http://backend-nest:3001` |
| `QUERY_ROUTER_URL` | Query router HTTP URL |
| `SHARD_MANAGER_URL` | Shard manager HTTP URL |
| `REDIS_HOST` / `REDIS_PORT` | Redis for health checks |
| `RUST_HEALTH_URL` | e.g. `http://rust-health:8083` |
| `FRONTEND_URL` | CORS origin |

## Local development (without Docker)

1. Start Postgres + Redis + query-router + shard-manager (or use compose for deps only).
2. Run Nest on **3002**: `cd backend && npm run start:dev` (set `PORT=3002`).
3. Run Go: `cd backend-go && set PROXY_FALLBACK_URL=http://localhost:3002 && set DATABASE_URL=... && set JWT_SECRET=... && go run ./cmd/server`

## Removing Nest later

Port each Nest module into Go (or split microservices), then drop `PROXY_FALLBACK_URL` and the `backend-nest` service.
