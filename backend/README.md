# AGI Dashboard Backend

FastAPI modular monolith skeleton for the Black Box Democracy dashboard.

## Getting Started
- Create a virtual environment with Python 3.11+.
- Install dependencies: `pip install .` (or `pip install .[dev]` for lint/tests).
- Run locally: `uvicorn app.main:app --reload`.

## Layout
- `app/core`: config and logging.
- `app/db`: database engine and session management (SQLite).
- `app/modules`: domain modules (auth, observables/events, utility/optimization, algorithm).
- `app/api/router.py`: aggregates module routers under `/api/v1`.

## Testing
- Run tests: `pytest`.
