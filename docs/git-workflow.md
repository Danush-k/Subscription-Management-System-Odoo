# Brightloop Git Workflow & Branching Guidelines

## 1. Branch Topology

```
main (Production Ready)
 │
 └── develop (Integrated & Tested Feature Staging)
      │
      ├── feature/project-setup
      ├── feature/authentication
      ├── feature/user-management
      ├── feature/customer-management
      ├── feature/product-management
      ├── feature/product-variants
      ├── feature/tax-management
      ├── feature/subscription-plans
      ├── feature/quotation-templates
      ├── feature/quotation-management
      ├── feature/subscription-management
      ├── feature/recurring-billing
      ├── feature/invoice-management
      ├── feature/discount-management
      ├── feature/payment-management
      ├── feature/customer-portal
      ├── feature/admin-dashboard
      ├── feature/analytics
      ├── feature/reporting
      ├── feature/email-notifications
      └── feature/pdf-generation
```

---

## 2. Branch Responsibilities

- **`main`**: The single source of truth for stable, audited, production releases. Only merged from `develop` upon full phase sign-off and passing all automated test suites.
- **`develop`**: Central integration branch. All completed and verified feature branches merge into `develop`.
- **`feature/*`**: Dedicated branches for scoped functional modules. Created off `develop` and merged back via non-fast-forward or squash merge after passing unit/integration checks.

---

## 3. Commit Message Conventions

Strictly adhere to **Conventional Commits**:
`<type>(<scope>): <subject in imperative tense>`

Valid types:
- `feat`: A new user-facing or backend feature
- `fix`: A bug fix
- `docs`: Documentation updates
- `style`: Formatting, missing semi-colons, no code changes
- `refactor`: Code restructuring without modifying behavioral contract
- `perf`: Performance optimizations
- `test`: Adding or correcting tests
- `chore`: Build tooling, dependency, or config updates

### Examples:
- `feat(auth): implement session validation and RBAC guards`
- `feat(billing): implement BullMQ recurring billing engine with idempotency`
- `fix(invoice): prevent duplicate invoice generation on month-end transition`
- `test(subscription): add lifecycle state machine transition tests`
- `docs(database): document 26 entities and ER relationships`

---

## 4. Contributor and Authorship Standards

- Commits must use the verified repository owner's git author metadata (`Danush K <danusu2470030@ssn.edu.in>`).
- **Strict Prohibition:** Absolutely no third-party AI assistant names, trailers, or co-author signatures are permitted anywhere in commit histories, tags, or repository documentation.
- Commit messages must remain clean, professional, and descriptive single-line or standard git formatted messages.
