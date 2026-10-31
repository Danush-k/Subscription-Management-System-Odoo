# Brightloop Subscription Management System - System Architecture

## 1. Executive Summary

Brightloop Software provides a multi-tier SaaS subscription platform designed to replace disparate spreadsheets, manual billing, and disjointed payment tracking with an enterprise-grade automated engine. The system covers the complete subscription lifecycle: customer onboarding, product catalog with variants, quotations, lifecycle transitions, automated recurring billing via BullMQ, invoice generation, discount & tax calculations, payment reconciliation with partial payments, and role-based portals (Admin, Staff, Customer).

The user interface draws design inspiration from **Odoo's modular enterprise app launcher and workspace** combined with **Zoho's clean, data-dense financial workflows** and **Stripe's sleek modern SaaS aesthetic**.

---

## 2. High-Level Architecture Diagram

```
+---------------------------------------------------------------------------------------------------+
|                                      CLIENT APPLICATION (Next.js)                                 |
|                                                                                                   |
|   +-----------------------+     +-----------------------+     +-------------------------------+   |
|   |   (admin) Dashboard   |     |   (staff) Operations  |     |   (customer) Self-Service     |   |
|   |  - Catalogs & Plans   |     |  - Quotations         |     |  - Subscriptions & Invoices   |   |
|   |  - Taxes & Discounts  |     |  - Subscriptions      |     |  - Profile & Payments         |   |
|   |  - Revenue Analytics  |     |  - Payment Recording  |     |  - Pause / Renewal Requests   |   |
|   +-----------+-----------+     +-----------+-----------+     +---------------+---------------+   |
|               |                             |                                 |                   |
|               +-----------------------------+---------------------------------+                   |
|                                             |                                                     |
|                                             v                                                     |
|                                 +-----------------------+                                         |
|                                 |  Odoo-Style App Hub   |                                         |
|                                 | & shadcn/ui Component |                                         |
|                                 |       Primitives      |                                         |
|                                 +-----------+-----------+                                         |
+---------------------------------------------|-----------------------------------------------------+
                                              |
                                              v (Server Actions / Route Handlers)
+---------------------------------------------------------------------------------------------------+
|                                    BACKEND APPLICATION TIER                                       |
|                                                                                                   |
|  +--------------------+  +--------------------+  +--------------------+  +--------------------+   |
|  | Auth & RBAC Guard  |  | Input Validator    |  | Exception & Error  |  | Audit Logger       |   |
|  | (Auth.js / bcrypt) |  | (Zod DTO Schemas)  |  | Handling Filter    |  | Service            |   |
|  +---------+----------+  +---------+----------+  +---------+----------+  +---------+----------+   |
|            |                       |                       |                       |              |
|            +-----------------------+-----------------------+-----------------------+              |
|                                    |                                                              |
|                                    v                                                              |
|                     +-----------------------------+                                               |
|                     |        SERVICE LAYER        |                                               |
|                     |  - SubscriptionService      |                                               |
|                     |  - BillingEngineService     |                                               |
|                     |  - InvoiceService           |                                               |
|                     |  - TaxCalculationService    |                                               |
|                     |  - DiscountEngineService    |                                               |
|                     |  - PaymentReconciliation    |                                               |
|                     |  - AnalyticsEngineService   |                                               |
|                     +--------------+--------------+                                               |
|                                    |                                                              |
|                                    v                                                              |
|                     +-----------------------------+                                               |
|                     |      REPOSITORY LAYER       |                                               |
|                     |  (Prisma ORM Client Model)  |                                               |
|                     +--------------+--------------+                                               |
+------------------------------------|--------------------------------------------------------------+
                                     |
                 +-------------------+-------------------+
                 |                                       |
                 v                                       v
+---------------------------------+     +---------------------------------+
|       RELATIONAL STORAGE        |     |       BACKGROUND WORKERS        |
|  PostgreSQL Database (Prisma)   |     |    BullMQ + Redis Task Queue    |
|  - Strict NUMERIC/Decimal math  |     |  - Automated Recurring Billing  |
|  - Foreign key constraints      |     |  - Overdue Invoice Detection    |
|  - Unique billing idempotency   |     |  - Subscription Expiry/Renewal  |
|  - Immutable audit & snapshots  |     |  - Resend Email Dispatcher      |
|  - Normalized 26+ entities      |     |  - React-PDF Document Generator |
+---------------------------------+     +---------------------------------+
```

---

## 3. Technology Stack & Key Decisions

### 3.1 Frontend
- **Framework:** Next.js 15+ (App Router).
- **Language:** TypeScript 5+ (Strict Mode).
- **Styling:** Tailwind CSS with custom design tokens for Odoo deep purple (`#714B67`), warm slate, and vibrant Zoho-like accent tags.
- **Component Primitives:** shadcn/ui (Radix UI accessible primitives).
- **Icons:** Lucide React.
- **Form Management & Validation:** React Hook Form + Zod resolvers.
- **Data Tables:** TanStack Table v8 (virtualized, paginated, sortable, multi-filtered).
- **Charts & Visualizations:** Recharts (responsive revenue trends, MRR/ARR trajectories, category breakdowns).

### 3.2 Backend & Business Logic
- **Architecture:** Tiered Architecture with strict separation:
  - **Controllers / Route Handlers / Server Actions:** Pure protocol adaptors; zero direct business or database access logic.
  - **DTOs & Validations:** Zod schemas for all inbound mutation payloads and query parameters.
  - **Service Layer:** Houses domain rules (e.g. state machine transitions, month-end billing date alignment, discount evaluation, tax stacking).
  - **Repository Layer:** Abstracted Prisma queries with transaction management (`prisma.$transaction`).
- **Financial Arithmetic:** Decimal arithmetic via `decimal.js` and Prisma Decimal. **Zero floating-point operations** are permitted for monetary quantities.

### 3.3 Relational Database (PostgreSQL + Prisma)
- Strict foreign key constraints with `RESTRICT` on financial records to prevent cascading accidental deletes.
- Custom database indexes on foreign keys, status fields, composite keys for idempotency (`subscriptionId + billingPeriodStart`), and date-range filters.
- PostgreSQL `NUMERIC(15, 2)` or `NUMERIC(15, 4)` precision on unit prices, tax rates, line item totals, discounts, invoices, and payments.

### 3.4 Background Jobs & Asynchronous Workflows
- **Queue Engine:** BullMQ backed by Redis.
- **Separation of Concerns:** Persistent background worker processes run detached from serverless HTTP request lifecycles.
- **Billing Idempotency:** DB unique constraints (`subscriptionId_billingPeriodStart`) prevent duplicate invoices even under concurrent queue workers or duplicate triggers.

### 3.5 Communications & Document Rendering
- **Email:** Resend API integration with modular HTML transaction templates.
- **PDF Generation:** `@react-pdf/renderer` generating pixel-perfect invoices, quotations, and official receipts with company headers, customer details, line tables, tax breakdowns, and payment history.

---

## 4. User Roles and Authorization Matrix

| Capability / Module | ADMIN | STAFF | CUSTOMER |
| :--- | :---: | :---: | :---: |
| Staff Account Provisioning | Yes | No | No |
| Customer Management (Create/Update/Deactivate) | Yes | Yes | Own Profile Only |
| Product & Variant Catalog Configuration | Yes | Read Only | Read Only (Portal) |
| Global Tax & Discount Rules Configuration | Yes | No | No |
| Subscription Plan Configuration | Yes | Read Only | Read Only |
| Quotation Generation & Management | Yes | Yes | View / Accept Own |
| Subscription Lifecycle Control (Pause/Close/Renew) | Yes | Yes | Permitted Actions Only |
| Automated Billing Execution / Overrides | Yes | View Only | No |
| Invoice Management (Confirm/Cancel/Download) | Yes | Yes | View / Download Own |
| Payment Recording & Partial Reconciliations | Yes | Yes | View Own Receipts |
| Executive Revenue Analytics & Financial Reports | Yes | Permitted Reports | No |
| Customer Self-Service Portal Access | No (via Admin) | No (via Staff) | Yes |

---

## 5. Security & Compliance Standards

1. **Password Security:** Scrypt or bcrypt (salt rounds >= 12) with stringent password complexity rules.
2. **Data Isolation:** Every customer query is bounded by the session's authenticated `customerId` at the service and repository layers.
3. **Immutability of Invoiced Data:** Once an invoice is confirmed, it references snapshot tables storing customer address, product name, historical price, and tax rate at time of issuance.
4. **Audit Logging:** Every administrative mutation, state transition, and manual financial override produces an immutable `AuditLog` entry.
