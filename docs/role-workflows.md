# Brightloop Role Workflows and Verification Guide

This guide describes the implemented business flows for the Admin, Staff, and
Customer roles, the expected state changes, and what each role should observe.
It is intended for manual verification against the task requirements.

## 1. Start the application

From the project directory:

```powershell
npm install
npx prisma generate
npx prisma db push
npm run db:seed
```

Start the web application:

```powershell
npm run dev
```

Open `http://localhost:3000`.

The seed creates demo data. The local seed file may contain email addresses
different from the committed demo credentials, so use the credentials currently
present in `scripts/seed.mjs`.

## 2. Role access

| Role | Main purpose | Main entry point |
|---|---|---|
| Admin | Configure the system and manage all operational data | `/admin/dashboard` |
| Staff | Operate quotations, subscriptions, customers, invoices, and payments | `/staff/dashboard` |
| Customer | View their own account and use approved self-service actions | `/customer/dashboard` |

Authentication is session-based. Staff APIs require a Staff or Admin session.
Customer APIs must only expose the authenticated customer's own records.

## 3. Staff end-to-end workflow

### Flow A: Review the Staff dashboard

1. Sign in with a Staff account.
2. Open `/staff/dashboard`.
3. Confirm that the dashboard loads live data rather than placeholder-only
   counters.
4. Check the active B2B account KPI. It should count active customers only.
5. Confirm that operational queues link to quotations, subscriptions,
   invoices, and customer management.

**Logic:** The dashboard reads current database records. Inactive customers
remain in the database and history, but are excluded from the active-account
KPI.

**Expected visibility:**

- Staff sees operational metrics and links to Staff workflows.
- Admin can access the same Staff APIs because Admin is an authorized staff
  role.
- Customer cannot access Staff pages or APIs.

### Flow B: Search and inspect customers

1. Open `/staff/customers`.
2. Search by customer name, company, or email.
3. Filter active and inactive customers.
4. Open a customer record.
5. Review the customer profile, subscriptions, quotations, invoices, and
   payments.

**Logic:** Customer history is read from related database records. Staff can
inspect records but cannot use the Staff customer endpoints to access an
arbitrary unauthorized role or customer-only private session.

**Expected visibility:**

- Staff sees all seeded customers, including inactive customers marked
  `INACTIVE`.
- Admin sees the same records and has broader administrative screens.
- Customer sees only their own portal data, not the Staff customer directory.

### Flow C: Create and email a quotation

1. Open `/staff/quotations/new`.
2. Select a customer, subscription plan, and product.
3. Set the validity period.
4. Submit the quotation.
5. Confirm that the quotation is created and appears in the operational
   queue.
6. Confirm the email result shown by the page.

**Logic:** The API validates the Staff session, calculates quotation totals,
persists the quotation and lines, and attempts a Brevo email to the selected
customer email. Email dispatch is logged separately, so a mail failure does
not silently undo the quotation transaction.

**Expected visibility:**

- Staff sees the created quotation and its dispatch result.
- Admin can inspect the quotation in administrative screens.
- Customer can see the quotation in the customer portal when the record belongs
  to that customer.

### Flow D: Customer accepts or negotiates a quotation

1. Sign in as the customer associated with the quotation.
2. Open the quotations section on `/customer/dashboard`.
3. Accept the quotation, or submit a negotiation request if available.
4. Return to the Staff dashboard and refresh the quotation/operations view.

**Logic:** Customer actions are scoped to the authenticated customer. An
acceptance changes the quotation lifecycle state. A negotiation request records
the customer response for Staff follow-up; it does not create a subscription
until the conversion action is completed.

### Flow E: Convert a quotation to a subscription

1. Use a confirmed quotation.
2. Trigger the Staff conversion action.
3. Confirm that a subscription is created with the quotation's customer,
   plan, product lines, price, and billing policy.
4. Confirm that a subscription confirmation email is attempted.

**Logic:** Conversion preserves the commercial values from the quotation and
creates the subscription history needed for auditability. The subscription
starts in the lifecycle state defined by the conversion logic and must be
activated before recurring billing can process it.

**Expected visibility:**

- Staff sees the new subscription in `/staff/subscriptions`.
- Admin sees the subscription in administrative subscription screens.
- Customer sees the subscription in their portal after refresh.

### Flow F: Manage the subscription lifecycle

Open `/staff/subscriptions`, select a subscription, and test the allowed
actions:

1. Activate a confirmed subscription.
2. Pause an active subscription.
3. Resume a paused subscription.
4. Close a subscription when early closure is allowed.
5. Refresh the page after every action.

**Logic:** `SubscriptionService` validates every transition and plan policy:

- `CONFIRMED -> ACTIVE` for activation
- `ACTIVE -> PAUSED` only when pausing is allowed
- `PAUSED -> ACTIVE` when resumption is valid
- `ACTIVE -> CLOSED` only when early closure is allowed
- Closed subscriptions are terminal

Each successful action records the previous status, new status, action, and
timestamp in subscription history. Activation and resumption recalculate the
next billing date where required.

**Expected visibility:**

- Staff sees the updated status, policy flags, and next billing date.
- Admin sees the same persisted lifecycle state.
- Customer sees the updated status and permitted self-service controls.
- Invalid actions show an error and do not change the database.

### Flow G: View invoices and record payments

1. Open `/staff/invoices`.
2. Filter or inspect the customer's invoice history.
3. Record a partial payment.
4. Confirm that paid amount increases and outstanding amount decreases.
5. Record the remaining valid amount.
6. Confirm the invoice becomes `PAID`.
7. Attempt an overpayment and confirm that it is rejected.
8. For non-cash methods, test missing and duplicate transaction references.
9. Reverse a payment and confirm invoice reconciliation.
10. Generate the printable receipt.

**Logic:** Payment operations are atomic and validate positive amounts,
outstanding balance, transaction references, duplicate references, and refund
state. Payment actions create audit records. Invoice status is recalculated
from payment totals.

**Expected visibility:**

- Staff sees partial payment details, outstanding balance, receipt action, and
  refund/reversal result.
- Admin sees the reconciled invoice and payment audit information.
- Customer sees their own invoice/payment status and receipt information.

### Flow H: Process overdue invoices

1. Use an invoice with a past due date and outstanding balance.
2. Run the billing worker.
3. Refresh `/staff/invoices`.

The invoice should become `OVERDUE`. A paid invoice must not be changed to
overdue because its outstanding amount is zero.

## 4. Admin workflows

### Configuration and master data

Admin can manage:

- Customers
- Products and variants
- Subscription plans
- Taxes
- Discounts
- Subscriptions
- Invoices and payments
- Reports and dashboard metrics

Changes to plans, taxes, and discounts affect future calculations according to
the relevant policy. Confirmed invoice/customer snapshots preserve historical
values rather than rewriting old financial records.

### Admin verification

1. Sign in as Admin.
2. Open `/admin/dashboard`.
3. Open each master-data page.
4. Create or edit a test configuration record.
5. Confirm that the Staff workflow reads the appropriate current configuration.
6. Confirm that existing invoices retain their historical totals and snapshots.

Admin is also authorized to use Staff operational APIs, but Admin screens
should be used for configuration and broad administration.

## 5. Customer workflows

### Customer dashboard

1. Sign in as a Customer.
2. Open `/customer/dashboard`.
3. Confirm that only the authenticated customer's records are shown.
4. Review quotations, subscriptions, invoices, payments, and account details.

### Customer subscription actions

For a permitted subscription:

1. Pause it if the plan allows pausing.
2. Resume it from the paused state.
3. Cancel/close it if early closure is allowed.
4. Refresh the Staff subscription page.

Staff should see the persisted customer action as `PAUSED`, `ACTIVE`, or
`CLOSED`, including the corresponding history entry and timestamps.

### Customer payments

1. Open an unpaid or partially paid invoice.
2. Submit a valid payment.
3. Confirm the invoice balance and status update.
4. Attempt an invalid amount and confirm an error is returned.

Customer payment records must update only invoices owned by that customer.

## 6. Email behavior

Emails are sent to the email address stored on the related Customer record:

- Quotation email: selected customer's email
- Subscription confirmation: converted quotation customer's email
- Invoice email: invoice customer's email
- Payment receipt: payment invoice customer's email
- Recurring billing invoice: subscription customer's email

Brevo configuration must include a valid API key and verified sender:

```env
BREVO_API_KEY="..."
FROM_EMAIL="verified-sender@example.com"
FROM_NAME="BrightLoop"
```

Email dispatch is not required for the database transaction to succeed. The
application records sent, skipped, or failed dispatch status in the audit log.
Never commit `.env` or expose an API key.

## 7. Billing worker and continuous operation

The billing worker is currently a one-shot command:

```powershell
npm run worker
```

It:

1. Finds active subscriptions whose `nextBillingDate` has arrived.
2. Creates an invoice for each due subscription.
3. Advances the subscription billing date.
4. Writes billing history and subscription audit history.
5. Marks eligible overdue invoices as `OVERDUE`.
6. Skips an already successful billing period using the billing-history
   uniqueness rule.

`npm run worker` exits after one run. It is not a permanent background
process. For automatic billing, schedule the command with Windows Task
Scheduler, or run it from a process manager at a chosen interval. The web
server does not need to be continuously running for a separately scheduled
worker, but the database must be available.

The development server is different:

```powershell
npm run dev
```

It must remain running while users click buttons and call application APIs.
The worker is not needed for quotation creation, customer cancellation,
manual payment, or other immediate button-driven operations. It is needed for
scheduled recurring billing and overdue processing.

## 8. Suggested manual verification order

Use separate terminals:

```text
Terminal 1: npm run dev
Terminal 2: npx prisma studio
Terminal 3: npm test
```

Then verify in this order:

1. Admin configuration and dashboard
2. Staff customer search and customer history
3. Staff quotation creation and email dispatch status
4. Customer quotation acceptance/negotiation
5. Staff quotation conversion
6. Customer subscription view and cancellation
7. Staff subscription status refresh
8. Staff partial payment and overpayment rejection
9. Payment reversal and receipt generation
10. `npm run worker` for overdue and recurring billing
11. Refresh all three role views and compare persisted results

