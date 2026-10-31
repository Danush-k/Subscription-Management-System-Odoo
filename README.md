# Brightloop – Enterprise Subscription Management System

Brightloop is a full-featured, automated Subscription Management System built for modern SaaS companies. Inspired by **Odoo's modular enterprise app launcher** and **Zoho's streamlined financial dashboards**, Brightloop eliminates spreadsheets and manual reconciliation through automated recurring billing, atomic financial transactions, quotation-to-subscription workflows, and customer self-service portals.

---

## Key Features

- **Odoo & Zoho Inspired UI/UX:** Clean top-level app launcher, customizable workspace modules, rich status tags, and real-time metric cards.
- **Product & Multi-Tier Variant Engine:** Base products with customizable add-on tiers (e.g. Standard, Odoo Edition, Enterprise) with precise dynamic price calculations.
- **Subscription Lifecycle State Machine:** Strict validation across transitions: `DRAFT` → `QUOTATION` → `CONFIRMED` → `ACTIVE` → `PAUSED` → `CLOSED` → `EXPIRED`.
- **Automated Recurring Billing Engine:** BullMQ & Redis worker processes executing idempotent daily, weekly, monthly, and yearly billing runs with database-level uniqueness guarantees.
- **Financial Precision & Integrity:** PostgreSQL `NUMERIC` types, Decimal arithmetic (`decimal.js`), and immutable customer/tax/product snapshots on confirmed invoices.
- **Taxes & Intelligent Discounts:** Multi-rule tax configurations (inclusive/exclusive) and percentage/fixed discount rules with usage limits and automatic application.
- **Payment Reconciliation:** Multi-method payments (Cash, UPI, Cards, Bank Transfer) supporting partial payments, outstanding balances, and receipt issuance.
- **Role-Based Access Control (RBAC):** Strict separation between `ADMIN`, `STAFF`, and `CUSTOMER` roles, guaranteeing customer data isolation.
- **Comprehensive Analytics:** Clear differentiation between Invoiced Revenue, Collected Revenue, Outstanding Receivables, and Monthly/Annual Recurring Revenue (MRR/ARR).

---

## Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | Next.js (App Router), React 19, TypeScript, Tailwind CSS, shadcn/ui, Lucide React, TanStack Table, Recharts |
| **Backend** | Next.js Route Handlers, Server Actions, Service Layer, Repository Pattern, Zod DTO validation |
| **Database & ORM** | PostgreSQL, Prisma ORM, Decimal precision types |
| **Asynchronous Engine** | Redis, BullMQ (persistent worker processes) |
| **Email & Documents** | Resend, `@react-pdf/renderer` |
| **Testing** | Vitest, React Testing Library, Playwright |

---

## Documentation

- [System Architecture](file:///Users/danush/Desktop/Subcription-Management-System-Oodo/docs/architecture.md)
- [Database Design & ER Specification](file:///Users/danush/Desktop/Subcription-Management-System-Oodo/docs/database-design.md)
- [Git Branching & Workflow](file:///Users/danush/Desktop/Subcription-Management-System-Oodo/docs/git-workflow.md)
- [Development Progress Tracker](file:///Users/danush/Desktop/Subcription-Management-System-Oodo/DEVELOPMENT_PROGRESS.md)

---

## Getting Started

### Prerequisites
- Node.js >= 20.x
- PostgreSQL >= 15
- Redis >= 7

### Installation
```bash
# Clone the repository
git clone https://github.com/Danush-k/Subscription-Management-System-Odoo.git
cd Subscription-Management-System-Odoo

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env

# Run Prisma migrations
npx prisma migrate dev

# Start development server
npm run dev
```

---

## Branching Strategy

Development strictly adheres to the Git branching model:
- `main`: Production-ready releases
- `develop`: Integrated development branch
- `feature/*`: Granular module implementations
