# Engineering Decisions

## Multi-tenancy

The platform uses a shared PostgreSQL database with tenant-scoped entities carrying `tenant_id`. Tenant resolution prefers the authenticated principal, can also use subdomain context, and only falls back to `X-Tenant-Id` when there is no authenticated tenant. Conflicting tenant signals are rejected to preserve isolation.

## Security

Spring Security is stateless, password hashing uses BCrypt, and JWT is the primary access model. Refresh tokens and verification tokens are stored hashed so database exposure does not leak usable bearer secrets. Rate limiting is applied to authentication-sensitive routes.

## Feature Packaging

Feature flags and subscription plans are first-class domain concepts so modules like finance, analytics, and parent alerts can be enabled per tenant without changing the data model later.

## Architecture

Acadex is intentionally being built as a modular monolith first. This keeps transaction boundaries simple while the domain model stabilizes. Service boundaries such as auth, tenant management, academics, finance, notifications, and analytics are kept explicit in package structure so the system can later be extracted if scaling or team structure demands it.

## Data Integrity

Finance and webhook handling are designed around idempotency and uniqueness constraints. Sensitive business events should be append-only from the application point of view through audit logging so destructive mutations can still be traced.

## Operations

Redis and RabbitMQ are included from the start to support caching, queues, notifications, and other asynchronous workflows as the platform grows. Prometheus and Grafana starter configuration are committed so observability can mature alongside feature delivery rather than becoming a late-stage retrofit.
