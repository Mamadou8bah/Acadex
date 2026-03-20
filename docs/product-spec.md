# Acadex Product Specification

## 1. Product Definition

Acadex is a multi-tenant school management SaaS platform for schools that need academic operations, billing, communication, and analytics in one system while preserving strict tenant isolation.

Primary audiences:

- Platform owner operating the SaaS
- School administrators managing each tenant
- Teachers handling classroom operations
- Students viewing academic progress
- Parents monitoring attendance, fees, and communication

## 2. Scope

### 2.1 V1 Scope

Acadex V1 includes:

- Multi-school onboarding and tenant lifecycle management
- JWT-based authentication with refresh, verification, and password reset flows
- Tenant-aware RBAC for platform and school roles
- User lifecycle management for admins, teachers, students, and parents
- Academic structure management for sessions, terms, classes, subjects, and enrollments
- Attendance capture and reporting
- Exams, grading schemes, score entry, and report generation APIs
- Fee structures, invoices, payment recording, and payment webhook ingestion
- Announcements, teacher-parent messaging, and in-app notification outbox
- Audit logging for sensitive actions
- Dashboard analytics endpoints
- Dockerized local deployment, OpenAPI docs, and baseline observability

### 2.2 Out of Scope for V1

The following are explicitly deferred so the first release stays coherent:

- Native mobile apps
- Timetable generation and transport routing optimization
- Payroll and HR workflows
- Full LMS features such as assignments, quizzes, and content hosting
- Real-time chat with presence indicators
- Online payment gateway settlement logic beyond webhook ingestion and idempotent recording
- Multi-region deployment
- Custom report builder for end users

## 3. User Flows

### 3.1 School Onboarding

1. A school admin registers the school and initial administrator account.
2. The platform creates the tenant, subscription plan, and default feature package.
3. The admin verifies email, logs in, and receives a tenant-scoped JWT.
4. The admin configures school profile, academic year, terms, classes, and initial staff.

Acceptance:

- A newly created school is isolated from every other tenant.
- The initial admin can access only their tenant data.
- Unverified users cannot complete protected school management operations.

### 3.2 Student Admission and Enrollment

1. A school admin creates or bulk imports student accounts.
2. The admin places each student in a class for an academic year.
3. Teachers for that class can view only students assigned within their tenant scope.

Acceptance:

- Duplicate enrollment in the same academic year is rejected.
- Enrollment history remains queryable after class changes.

### 3.3 Attendance Tracking

1. A teacher opens the attendance workflow for a class and date.
2. The teacher marks each student present, absent, or late.
3. The system stores tenant-scoped attendance records and updates analytics.
4. If parent alerts are enabled, the notification job publishes absence alerts asynchronously.

Acceptance:

- Attendance cannot be created for students outside the teacher's tenant.
- Repeated submissions for the same student/date/class must not silently duplicate records.

### 3.4 Exam and Report Cycle

1. A school admin or teacher defines an exam and grading scheme.
2. Teachers record scores for enrolled students.
3. The system calculates grades and aggregates class performance.
4. Reports can be generated individually or in batch for distribution.

Acceptance:

- Scores above exam maximum are rejected.
- Grade calculations use the active grading scheme for the tenant.
- Report generation must be deterministic for the same dataset.

### 3.5 Billing and Payment

1. A school admin creates fee structures by class.
2. The system generates invoices for students.
3. Payment events are recorded manually or via webhook.
4. Outstanding balances and collection analytics update after payment processing.

Acceptance:

- Payment references are unique and idempotent.
- A duplicate webhook must not create duplicate payment records.
- Outstanding balances reflect invoice and payment state changes.

## 4. Domain Model

### 4.1 Core Entities

- `School`: tenant identity, subscription plan, status, and feature entitlements
- `UserAccount`: tenant-scoped user with platform or school role
- `AcademicYear`, `Term`, `SchoolClass`, `Subject`, `SubjectAssignment`, `StudentEnrollment`
- `AttendanceRecord`
- `Exam`, `GradingScheme`, `StudentScore`
- `FeeStructure`, `Invoice`, `PaymentRecord`
- `Announcement`, `MessageThread`, `NotificationOutbox`
- `AuditLog`, `RefreshToken`, `VerificationToken`, `WebhookEvent`

### 4.2 Ownership and Access Rules

- `Super Admin` can manage all tenants at platform scope.
- `School Admin` can manage tenant configuration, users, academics, finance, and reporting within one tenant.
- `Teacher` can access assigned classes, attendance, announcements, exams, and messaging inside one tenant.
- `Student` can access personal academic and billing records only.
- `Parent` can access linked student records only; one parent may be linked to multiple students in future iterations.

### 4.3 School Configuration

Each tenant must be configurable for:

- School name, slug, status, and contact email
- Subscription plan and feature entitlements
- Academic calendar
- Grading scheme
- Class structure
- Currency, timezone, and locale

## 5. API and Integration Standards

### 5.1 API Conventions

- Base path: `/api/v1`
- JSON request and response bodies
- Pageable list endpoints for all collection reads
- Stable error envelope through global exception handling
- OpenAPI documentation as part of the backend deliverable

### 5.2 Tenant Resolution Order

Tenant context is resolved in this order:

1. Verified tenant claim from the authenticated principal
2. Subdomain-based resolution when present
3. `X-Tenant-Id` request header only when no authenticated tenant is available

Rules:

- If a JWT tenant claim and header disagree, the request is rejected.
- Every tenant-scoped write must execute with resolved tenant context.
- Cross-tenant reads and writes are forbidden except for platform super admin capabilities.

### 5.3 Authentication and Session Rules

- Access tokens are short-lived JWTs.
- Refresh tokens are stored hashed and can be revoked.
- Email verification is required for full account activation.
- Password reset tokens are single-use and time-bounded.
- Admin MFA is a recommended post-V1 enhancement.

### 5.4 Idempotency and Webhooks

- Payment references must be unique across the platform.
- External webhook events must be stored by external event identifier before processing.
- Retried webhook deliveries must return a safe success response when already processed.

## 6. Non-Functional Requirements

### 6.1 Availability and Reliability

- Target service availability for production: `99.5%` monthly for V1
- Critical background jobs must support retry and dead-letter handling
- Database migrations must be forward-only and repeatable in CI and production
- Backup frequency target: daily full snapshot plus point-in-time recovery where available

### 6.2 Performance

- P95 authenticated API latency target: under `500 ms` for standard CRUD endpoints at normal load
- P95 dashboard endpoint latency target: under `1200 ms` with caching enabled
- Bulk imports must process in batches to avoid request timeouts

### 6.3 Scale Assumptions

V1 should comfortably support:

- 100 schools
- 2,000 users per school
- 10,000 attendance or score writes per school per day

These assumptions drive index design, pagination, and cache strategy.

### 6.4 Security

- BCrypt password hashing
- Rate limiting on authentication endpoints
- Input validation on all write models
- Strict tenant isolation at filter, service, and repository boundaries
- File upload validation for content type and size
- Secret values supplied through environment configuration

### 6.5 Observability

- Structured logs with tenant and request correlation where possible
- Health check endpoints for runtime and dependency visibility
- Metrics export compatible with Prometheus
- Optional Grafana dashboards for local and production monitoring

## 7. Testing and Release Standards

V1 engineering quality requires:

- Unit tests for service logic and validation rules
- Integration tests for authentication, tenant isolation, and persistence behavior
- Contract tests for critical finance and auth endpoints
- End-to-end smoke tests for onboarding, attendance, grading, and payment flows
- CI execution for build, test, and migration verification

Definition of done for a feature:

- API documented
- Validation implemented
- Tenant isolation enforced
- Audit event added for sensitive mutations
- Tests added or updated
- Failure cases handled explicitly

## 8. Acceptance Criteria by Module

### 8.1 Tenant Management

- Schools can be created, updated, suspended, and activated.
- Subscription plan changes alter feature availability without code changes.
- Tenant usage metrics are visible to the platform owner.

### 8.2 Authentication and Authorization

- Login returns access and refresh tokens for active users only.
- Refresh rotates or reissues access safely from a valid stored refresh token.
- Unauthorized or cross-tenant requests are rejected.

### 8.3 User Management

- Tenant admins can create, update, activate, and deactivate tenant users.
- Bulk import validates records and returns actionable errors for invalid rows.
- Role changes produce audit log entries.

### 8.4 Academic Management

- A tenant can define academic years, terms, classes, subjects, and teacher assignments.
- Students can be enrolled into classes for a specific academic year.
- Duplicate term-scoped subject assignments are prevented.

### 8.5 Attendance

- Attendance can be created and queried by class, student, and date range.
- Tenant-scoped attendance analytics are available.
- Parent absence alerts depend on feature enablement.

### 8.6 Exams and Grading

- Exams are linked to subject, class, and term.
- Scores are validated against exam maximums.
- Grading schemes are configurable per tenant and used in result calculation.

### 8.7 Finance

- Fee structures and invoices are tenant-scoped.
- Payment recording updates invoice status safely.
- Financial analytics expose paid, unpaid, and overdue summaries.

### 8.8 Communication and Notifications

- Announcements can target school-wide or narrower audiences.
- In-app notifications are persisted to an outbox for asynchronous processing.
- Teacher-parent messaging can be feature-gated if needed by subscription.

### 8.9 Audit Logging

- Grade changes, fee changes, user role changes, and destructive actions emit audit entries.
- Audit logs include actor, entity type, entity id, action, and metadata.
- Audit log records are append-only from the application perspective.

## 9. Delivery Artifacts

The complete recruiter-ready deliverable should include:

- Source repository with modular backend and frontend
- README with local setup and architecture summary
- OpenAPI docs
- ERD and architecture diagrams
- Engineering decisions log
- Deployment guide
- Demo screenshots or short walkthrough video
- Load and reliability test summary

## 10. Current Repository Alignment

The current repository already contains implementation foundations for:

- Multi-tenant request scoping
- JWT and refresh-token authentication
- School, user, academic, attendance, exam, finance, communication, analytics, notification, and audit modules
- Flyway migrations
- Docker Compose infrastructure
- Prometheus and Grafana starter configuration

The largest remaining work is not broad module creation but production hardening:

- deeper automated test coverage
- background worker execution maturity
- richer frontend workflows
- deployment automation
- diagrams and demo assets
