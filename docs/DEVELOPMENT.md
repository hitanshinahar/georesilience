# Development Guidelines

This document outlines the workflow and rules for contributing to the GeoShield AI repository.

## Repository Ownership

frontend/: Owned by frontend developers.
backend/: Owned by backend and integration developers.
ml/: Owned by ML development.
geospatial/: Owned by geospatial processing and routing developers.
shared/: Contains shared contracts only. Changes here should be coordinated because multiple systems depend on them.

## Branch Naming Convention

Use descriptive branch names following these prefixes:
feature/frontend-dashboard
feature/frontend-map
feature/backend-risk-api
feature/ml-xgboost
feature/ml-lstm
feature/geospatial-risk-grid
feature/geospatial-routing
fix/api-contract

## Development Rules

- Do not directly edit another team's work without discussion.
- Do not push directly to main.
- Use feature branches.
- Pull latest changes before starting work.
- Keep API contracts synchronized.
- Clearly label mock data.
- Do not commit secrets.
- Do not commit huge datasets or trained model files unless explicitly required.
