# AGI Dashboard Backend

FastAPI modular monolith skeleton for the Black Box Democracy dashboard.

## Getting Started
- Create a virtual environment with Python 3.11+.
- Install dependencies: `pip install .` (or `pip install .[dev]` for lint/tests).
- Run locally: `uvicorn app.main:app --reload`.
- Migrations (Alembic):
  - `alembic upgrade head` to apply
  - `alembic revision --autogenerate -m "message"` to create new migrations

## Configuration
- Create a `.env` in `backend/` (gitignored) before running. The app will refuse to start without a strong, non-default `SECRET_KEY` (32+ chars) unless `TESTING=1`.
- Recommended variables:
  ```
  PROJECT_NAME="AGI Dashboard API"
  ENVIRONMENT=dev
  API_PREFIX=/api/v1
  SECRET_KEY="<generate a 32+ char random value>"
  ACCESS_TOKEN_EXPIRE_MINUTES=30
  ALGORITHM=HS256
  SQLITE_DSN="sqlite+aiosqlite:///./data/app.db"
  ```
- Auth/logout stance: JWTs are stateless; logout is client-side token removal. There is no server-side revocation list yet—rotate `SECRET_KEY` to invalidate all tokens if needed.

## Layout
- `app/core`: config and logging.
- `app/db`: database engine and session management (SQLite).
- `app/modules`: domain modules (auth, observables/events, utility/optimization, algorithm).
- `app/api/router.py`: aggregates module routers under `/api/v1`.
- Default admin (dev): `admin` / `admin` (created on startup). Set a real `SECRET_KEY` and rotate credentials for non-dev.

## Demo Data
- Seed a couple of demo observables/events for UI testing: `python -m app.seeds.demo_seed` (run from `backend/` with venv + `.env` loaded; idempotent by name).

## Utility & Caching
- Event create/update/delete triggers a utility recompute and persists the derived values; snapshots are cached in-memory per observable for faster reads.
- `GET /observables/{id}/utility` returns cached snapshots when available; recompute endpoints force refresh.
- Global metrics aggregate from the cached/per-request snapshots; rotate the process if cache needs a full reset.

## Testing
- Run tests: `pytest`.
