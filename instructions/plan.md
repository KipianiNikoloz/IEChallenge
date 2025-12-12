# Project Plan

## Vision & Scope
- Build the Black Box Democracy dashboard: a React SPA with a FastAPI backend to monitor observables/humans, events, utility, optimization runs, and algorithm transparency.
- Single admin user with JWT auth; dark, monotone, objective UI with charts and algorithm visualizations; backend handles persistence and utility computation.

## Architecture & Key Decisions
### System Architecture
- Frontend: React SPA (TypeScript), React Router, chart library (e.g., Recharts), dark monotone theme (grayscale with a single accent reserved for alerts), communicates with backend via JSON over HTTPS.
- Backend: FastAPI REST API with SQLite via ORM, JWT authentication for a single admin, server-side business logic for utility computation, optimization behavior, and global metrics.
- Data Flow: SPA calls `/auth` for login, then `/observables`, `/events`, `/utility`, `/optimization`, `/algorithm`; backend persists entities and computes derived data for the UI.
### Architecture Style
- Modular monolith: clear domain modules (auth, observables/events, utility/optimization, algorithm/logging, shared/core) with internal interfaces and explicit boundaries; shared libraries for cross-cutting concerns (auth, config, logging, error handling).
### Domain Model
- User (Admin): id, username, password hash, role.
- Observable (Human): id, name, metadata, status (`STABLE`, `AT_RISK`, `OPTIMIZED`), utility_x, utility_y, utility_distance, timestamps.
- Event: id, observable_id, type (`PAST`, `PLANNED`, `OPTIMIZATION`), status (`FIXED`, `PLANNED`, `COMPLETED`, `FAILED`), label, description, sequence_index, is_cutoff, weight, timestamp, timestamps.
- OptimizationRun: id, observable_id, triggered_at, reason, pre-utility x/y, post-utility x/y, notes.
- UtilitySnapshot (optional): id, capture timestamp, average_distance, percent_below_cutoff, system_stability_index, snapshot_data.
### API Surface (FastAPI)
- Auth: `POST /api/v1/auth/login`, `POST /api/v1/auth/logout`, `GET /api/v1/auth/me`.
- Observables CRUD: `GET /api/v1/observables`, `POST /api/v1/observables`, `GET /api/v1/observables/{id}`, `PATCH /api/v1/observables/{id}`, `DELETE /api/v1/observables/{id}`.
- Events CRUD: `GET /api/v1/observables/{id}/events`, `POST /api/v1/observables/{id}/events`, `PATCH /api/v1/events/{event_id}`, `DELETE /api/v1/events/{event_id}`.
- Utility: `GET /api/v1/observables/{id}/utility`, `POST /api/v1/observables/{id}/utility/recompute`, `GET /api/v1/utility/global`.
- Optimization: `POST /api/v1/observables/{id}/optimize`, `GET /api/v1/observables/{id}/optimizations`.
- Algorithm (Black Box): `GET /api/v1/algorithm/summary`, `GET /api/v1/algorithm/logs`, optional modification endpoints.
### Utility + Cutoff Logic
- Utility_x increases with completed events, decreases with failed events, and is boosted by optimization events.
- Utility_y depends on past event weights and successful future/optimization events.
- Distance = √(x² + y²).
- Cutoff uses a fixed sigmoid curve y_cutoff(x); above_cutoff → safe, below_cutoff → eligible for optimization.
### Frontend Architecture + Routes
- `/login`: admin login.
- `/dashboard`: shared layout linking observables, global utility, algorithm views.
- `/dashboard/observables`: table of all observables.
- `/dashboard/observables/:id`: header, event chain visualization, utility meter (2D plane + cutoff), planned event controls, optimization button if below cutoff.
- `/dashboard/utility`: scatter plot with cutoff, histogram, global metrics.
- `/dashboard/algorithm`: abstract AI visualization, log feed, optional “Explain Objective” output.
### Core Interaction Flows
- Viewing a person; updating an event to trigger utility recompute; optimization flow to inject optimization events and shift utility; monitoring global health.
### Visualization & UI Cues
- Aesthetic: monotone, calculated, objective feel; high-contrast grayscale base; single accent only for alerts/critical states; rely on stroke/fill, size, and line style instead of multiple colors.
- Event chains per observable: left-to-right sequence, solid lines for confirmed history, dashed for planned; node size encodes weight; filled circles for completed, hollow for planned, accent-filled for failed/optimization; a mid-line divider marks cutoff/optimization breakpoint.
- Observable list alignment: each row pairs the historical chain with its forward-looking plan after the divider, maintaining consistent spacing and alignment for scanability.
- Utility plane: 2D scatter with sigmoid cutoff curve, quadrant labels (useful/useless vs convergent/divergent) rendered in neutral text; accent only for points below cutoff or optimization candidates.
- Utility bars: per-observable or aggregate bars with horizontal dashed lines for satisfaction thresholds; use neutral fills with accent only for over-threshold or risky bars.
- Global metrics: counts above/below cutoff, average distance, percent below cutoff, system stability index shown in neutral typography; accent reserved for warnings.
### Visualization Data Requirements
- Observables: id, name, status, utility_x, utility_y, distance, timestamps.
- Events: ordered by sequence_index with type, status, weight, timestamp, is_cutoff marker to render dividers; include optimization events inline.
- Cutoff function: sigmoid parameters/points to draw the curve and threshold lines for satisfaction bands.
- Aggregates: average_distance, percent_below_cutoff, system_stability_index, per-observable utility deltas pre/post optimization, and histogram buckets for utility distribution.
### Engineering Practices & Quality
- Coding principles: SOLID, DRY, small focused components/services, pure functions where possible, avoid code smells and tight coupling; favor composition over inheritance.
- Frontend: strict TypeScript, typed API clients, predictable state, hooks kept small, memoization only when measured; accessibility and keyboard support; monotone theme tokens for consistent styling.
- Backend: pydantic models for request/response contracts, service layer isolating FastAPI endpoints from domain logic, ORM models scoped to modules; input validation, explicit error handling with structured errors; idempotent operations where applicable.
- Cross-cutting: centralized logging with correlation IDs, configuration via env with sane defaults, secrets not committed; pagination for lists; consistent response envelopes.
- Testing: unit tests for domain logic and utility calculations; integration tests for API endpoints and DB interactions; contract tests for critical DTOs; frontend component/unit tests plus a few E2E happy paths; use fixtures/builders to avoid brittle tests; enforce lint/format/pre-commit checks.
- Production readiness: graceful shutdown, health/readiness endpoints, limited retries/backoff for outbound calls, metrics where useful, and monitoring-friendly logs.

## Backlog Overview
- Phasing: (1) Architecture & Data Model, (2) Backend Core, (3) Frontend Shell, (4) Feature Implementation, (5) Demo Data + Pseudo-Algorithm Content, (6) Polish + Testing.

## Current Sprint
- Sprint: Sprint 1 – Foundations
- Goals: (done) scaffold modular monolith structure for backend (FastAPI) and frontend (React TS), establish lint/format/test baselines, set monotone theme tokens and routing shells, provide health/auth stubs and data model placeholders; (next) implement real auth with JWT, add DB models with Alembic migrations for observables/events/utility, wire utility computation to persisted data, and connect frontend login + observables list to live API.
- Scope: project skeleton, configuration, quality tooling, initial routes/endpoints stubs, theme tokens and layout shells, plus auth + persistence + utility wiring and frontend auth/data hookup.
- Out of Scope: full optimization logic, advanced charts, production infra.

## Completed Work
- Backend/frontend scaffolding with monotone theme, routing shells, placeholder endpoints, and initial tests.

## Open Questions & Risks
- Not yet captured.
