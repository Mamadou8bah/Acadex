# Acadex

Acadex is a multi-tenant school management SaaS platform built as a modular monolith with a Spring Boot backend, a React + TypeScript frontend, and Dockerized local infrastructure.

## Product Direction

Acadex is designed for:

- platform operators managing many schools
- school administrators running day-to-day operations
- teachers recording academics and attendance
- students and parents viewing school information through tenant-scoped access

The project goal is to demonstrate production-minded engineering around tenant isolation, subscription-aware features, auditable workflows, and SaaS-ready deployment.

The full product specification lives in [docs/product-spec.md](docs/product-spec.md).

## Stack

- Backend: Java 17, Spring Boot, Spring Security, Spring Data JPA, PostgreSQL, Redis, RabbitMQ, Flyway, OpenAPI
- Frontend: React, TypeScript, Vite, Tailwind CSS, TanStack Query, Zustand, React Hook Form
- Infrastructure: Docker Compose, Prometheus, Grafana starter configs

## Repository Structure

- `backend`: APIs, domain modules, security, tenant context, migrations, and background processing foundations
- `frontend`: public site, dashboard shell, API clients, and feature hooks
- `docs`: product spec and engineering decisions
- `ops`: monitoring configuration

## Current Implementation

The repository already includes:

- Shared-database multi-tenancy with tenant-scoped entities and tenant context filters
- JWT authentication, refresh tokens, email verification, and password reset flows
- School onboarding and subscription plan modeling
- User, academic, attendance, exam, finance, communication, analytics, notification, file validation, and audit modules
- Payment webhook ingestion with event persistence
- Docker local stack with PostgreSQL, Redis, RabbitMQ, backend, and frontend
- OpenAPI config plus health and observability starters

## V1 Scope

Acadex V1 targets:

- school onboarding and tenant management
- authentication and tenant-aware authorization
- user and role management
- academic year, term, class, subject, and enrollment management
- attendance, exams, grading, report generation, and finance workflows
- announcements, notifications, messaging, and analytics
- audit logging, observability, and deployment-ready infrastructure

Items intentionally deferred are documented in [docs/product-spec.md](docs/product-spec.md).

## Run Locally

### Backend

```bash
cd backend
mvn spring-boot:run
```

Swagger UI: `http://localhost:8080/swagger-ui.html`

Important env vars:

- `JWT_SECRET`
- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- `UPLOADTHING_TOKEN` or `UPLOADTHING_API_KEY` + `UPLOADTHING_APP_ID`

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend app: `http://localhost:5173`

### Docker

```bash
docker compose up --build
```

## Documentation

- Product specification: [docs/product-spec.md](docs/product-spec.md)
- Engineering decisions: [docs/engineering-decisions.md](docs/engineering-decisions.md)

## Next Gaps

The main remaining work is production hardening rather than broad module creation:

1. Add deeper automated coverage for tenant isolation, finance idempotency, and end-to-end flows.
2. Mature asynchronous workers for notification delivery and report processing.
3. Expand role permissions from coarse roles to finer-grained capabilities.
4. Add CI/CD pipelines, deployment manifests, diagrams, and demo assets.
