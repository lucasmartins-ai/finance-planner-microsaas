# Documentation Index

This directory defines the public architecture and product documentation for Finance Planner MicroSaaS.

## Start Here

- [Product Spec](./product-spec.md) explains the problem, users, MVP scope, success metrics, and open questions.
- [Architecture](./architecture.md) explains the planned system shape, module boundaries, data flow, deployment model, and quality standards.
- [Data Model](./data-model.md) defines the PostgreSQL/Supabase schema direction.
- [Financial Calculations](./calculations.md) defines formulas that must be covered by tests.

## Engineering References

- [API Contracts](./api-contracts.md)
- [Security](./security.md)
- [Testing Strategy](./testing-strategy.md)
- [Development Guide](./development.md)
- [Roadmap](./roadmap.md)
- [ADR 0001 - Public MVP Stack](./adr/0001-public-mvp-stack.md)
- [ADR 0002 - SQLite Public Demo Scope](./adr/0002-sqlite-public-demo-scope.md)

## Documentation Rules

- Keep claims aligned with the implementation status.
- Keep formulas in one canonical place: [Financial Calculations](./calculations.md).
- Keep schema decisions in one canonical place: [Data Model](./data-model.md).
- Add an ADR when a decision changes deployment, persistence, auth, calculations, or public API behavior.
