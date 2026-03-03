# AGI Dashboard (Black Box Democracy)

Modular monolith scaffold: FastAPI backend + React TypeScript frontend with a monotone, objective aesthetic for observables, events, and utility visualizations. 

## Structure
- `backend/`: FastAPI app (modules for auth, observables/events, utility/optimization, algorithm) with SQLite ORM setup and stub endpoints.
- `frontend/`: React + Vite shell with routing, theme tokens, and placeholder feature pages.
- `instructions/`: internal planning (not committed).

## Getting Started
### Backend
1) `cd backend`
2) `python -m venv .venv && source .venv/bin/activate`
3) `pip install .[dev]`
4) `uvicorn app.main:app --reload`
5) Migrations: `alembic upgrade head` (create new with `alembic revision --autogenerate -m "msg"`)
6) Dev admin seed: username `admin`, password `admin` (change for real deployments; set `SECRET_KEY`)

### Frontend
1) `cd frontend`
2) `npm install`
3) `npm run dev`

## Testing
- Backend: `pytest`
- Frontend: `npm test` (Vitest + Testing Library)

## Notes
- Monotone theme with single accent reserved for alerts/at-risk states.
- API base URL defaults to `http://localhost:8000/api/v1` (configure `VITE_API_URL` as needed).
