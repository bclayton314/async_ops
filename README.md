# AsyncOps

AsyncOps is a production-style collaboration platform for distributed
software teams.

The project is designed to demonstrate full-stack application
engineering, automated testing, containerized development, CI/CD,
cloud deployment, and asynchronous engineering practices.

## Technology Stack

### Frontend

- React
- TypeScript
- Material UI
- Vite
- Vitest
- React Testing Library

### Backend

- Python
- FastAPI
- SQLAlchemy
- Alembic
- Pytest

## Features

- User registration and JWT authentication
- Persistent authenticated sessions
- Multi-tenant workspaces
- Owner, admin, and member roles
- Workspace member management
- Role-based authorization
- Project creation and management
- Task creation and status tracking
- PostgreSQL persistence
- SQLAlchemy ORM and Alembic migrations
- React and TypeScript frontend
- Docker Compose development environment
- Automated backend and frontend tests
- GitHub Actions CI

### Infrastructure

- PostgreSQL
- Docker
- Docker Compose

## Running Locally

Copy the example environment file:

```bash
cp .env.example .env



docker compose up --build -d

docker compose ps

docker compose exec backend alembic upgrade head

docker compose exec backend pytest

http://localhost:5173