# Contributing to GeoResilience

Welcome to the GeoResilience Monorepo! To ensure we move fast and avoid merge conflicts during the hackathon, please follow these guidelines.

## 1. Golden Rules
- **Never push directly to `main`.** Always use a branch.
- **Stay in your lane.** Only modify files in your assigned directory (see `docs/team-ownership.md`).
- **Do not change shared contracts** (`shared/contracts/`) without informing the team.
- **Ensure the app still runs** before opening a Pull Request.

## 2. Branch Naming
Prefix your branch with `feature/`, `fix/`, or `docs/`:
- `feature/frontend-command-center`
- `feature/field-reports`
- `feature/ml-risk-model`
- `feature/geospatial-impact`
- `feature/backend-api`
- `feature/integration`

## 3. Pull Request Process
1. Pull the latest `main` branch into your branch and resolve any conflicts locally.
2. Ensure your module runs successfully.
3. Open a Pull Request containing:
   - What changed
   - How to test it
   - Screenshots (if UI changed)
   - Any integration dependencies

## 4. Commit Format
Use small, focused commits with prefixes:
- `feat: added AI analysis visualization`
- `fix: resolved map marker rendering`
- `refactor: extracted dashboard layout`
- `docs: updated API contracts`
- `data: added mock priority incidents`
