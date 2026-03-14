# Acadex

Acadex is a multi-tenant school management SaaS platform starter with a Spring Boot backend, a React + TypeScript frontend, and Dockerized local infrastructure.

## Stack

- Backend: Java 17, Spring Boot, Spring Security, Spring Data JPA, PostgreSQL, Redis, RabbitMQ, Flyway, OpenAPI
- Frontend: React, TypeScript, Vite, Tailwind CSS, TanStack Query, Zustand, React Hook Form
- Infrastructure: Docker Compose

## Structure

- `backend`: API, security, tenant context, migration, core entities
- `frontend`: platform dashboard starter and API client scaffolding
- `docs`: engineering decisions and architecture notes

## Current Foundation

- Shared-database multi-tenancy with tenant-scoped entities
- JWT auth with refresh tokens and tenant context extraction
- School onboarding/listing starter endpoint at `/api/v1/platform/schools`
- Email verification and password reset token flows
- Resend email integration for onboarding and recovery workflows
- Subscription plans, user onboarding, announcements, notifications, analytics, and audit logging
- Docker local stack with PostgreSQL, Redis, RabbitMQ, backend, and frontend

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

## Recommended Next Steps

1. Expand the domain modules beyond the current backbone into academics, attendance, exams, grading, and fees.
2. Add background consumers to process the notification outbox and send emails asynchronously.
3. Add role/permission granularity beyond coarse platform roles.
4. Add tests, CI/CD, deployment manifests, and diagrams.
