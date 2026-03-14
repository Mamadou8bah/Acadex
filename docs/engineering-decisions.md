# Engineering Decisions

## Multi-tenancy

The platform uses a shared PostgreSQL database with tenant-scoped entities carrying `tenant_id`. Tenant context is currently extracted from request metadata and is intended to come from verified JWT claims in the next implementation phase.

## Security

Spring Security is configured as stateless and BCrypt is ready for password hashing. HTTP Basic is only a temporary bootstrap so routes are not left unprotected before JWT is implemented.

## Feature Packaging

Feature flags and subscription plans are first-class domain concepts so modules like finance, analytics, and parent alerts can be enabled per tenant without changing the data model later.

## Operations

Redis and RabbitMQ are included from the start to support caching, queues, notifications, and other asynchronous workflows as the platform grows.
