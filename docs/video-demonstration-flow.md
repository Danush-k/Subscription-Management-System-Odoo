# BrightLoop Video Demonstration Flow

This script shows the complete business workflow:

```text
Customer record
→ Staff quotation
→ Customer acceptance
→ Staff conversion
→ Subscription activation
→ Invoice generation
→ Payment
→ Updated status visible to every role
```

## 1. Before recording

From the project directory:

```powershell
npm run dev
```

Keep the development server running throughout the recording. Make sure the
database is seeded and that Brevo email configuration is valid:

```powershell
npm run db:seed
```

Use one browser window or profile per role so that sessions do not overlap:

- Admin window
- Staff window
- Customer window

Use a seeded customer with a valid email address. Record the customer email
shown in the Staff customer list so the email result can be demonstrated.

## 2. Opening statement

Say:

> This demonstration shows how BrightLoop manages a customer from quotation
> through subscription, invoice, and payment. Staff operates the commercial
> workflow, the customer accepts the proposal and pays, and Admin can monitor
> billing operations.

## 3. Staff: show the customer record

1. Open `http://localhost:3000/login`.
2. Sign in:

   ```text
   Email: staff@brightloopsoftware.com
   Password: BrightloopStaff#2026
   ```

3. Open `/staff/customers`.
4. Search for the selected customer.
5. Click **View details**.

Show these sections:

- Customer name and company
- Customer email
- Customer status
- Existing subscriptions
- Existing quotations
- Existing invoices
- Existing payments

Say:

> The Staff portal keeps the complete customer history in one place. The
> customer profile and company name remain unchanged while quotations,
> subscriptions, invoices, and payments are linked to this customer.

## 4. Staff: create a quotation

1. Open `/staff/quotations/new`.
2. Select the same customer.
3. Select a subscription plan.
4. Select a product.
5. Set the validity period.
6. Submit the quotation.

Show the success message:

```text
Quotation Created
```

Also show whether the email was sent.

Say:

> Staff creates a quotation containing the proposed plan, product, price, and
> validity period. This is only a proposal; it is not yet a subscription and
> does not create an invoice.

Expected result:

- Quotation status: `QUOTATION`
- Customer receives the quotation email
- No payment is recorded
- No recurring invoice is created yet

## 5. Customer: review and accept the quotation

1. Open the Customer browser window.
2. Sign in with the customer login:

   ```text
   Email: billing@ssntechlabs.com
   Password: BrightloopClient#2026
   ```

3. Open `/customer/dashboard`.
4. Open the quotations section.
5. Select the quotation created in the previous step.
6. Show the quotation number, plan, amount, and expiry date.
7. Click **Accept**.

Say:

> The customer reviews the proposal and accepts it. Acceptance confirms the
> customer's decision, but Staff still performs the controlled conversion into
> a subscription.

Expected result:

- Quotation status: `CONFIRMED`
- Customer acceptance is recorded
- Staff can now convert the quotation

If the seeded customer login is not linked to the customer selected in the
quotation, demonstrate the acceptance step with the customer account that is
linked to that quotation, or show the acceptance API result and continue with
the Staff conversion.

## 6. Staff: convert the quotation

1. Return to the Staff window.
2. Open the quotation/operations view.
3. Locate the confirmed quotation.
4. Click **Confirm and Convert**.
5. Show the success message and subscription number.

Say:

> Staff converts the confirmed quotation into a subscription. The system
> copies the customer, plan, product lines, price, billing frequency, payment
> terms, and lifecycle policies.

Expected result:

- Quotation status: `CONFIRMED`
- New subscription status: `CONFIRMED`
- Subscription history contains `QUOTATION_CONVERTED`
- Customer receives a subscription confirmation email
- No payment has been taken yet
- No invoice has been created yet

## 7. Staff: activate the subscription

1. Open `/staff/subscriptions`.
2. Locate the new subscription.
3. Click **Activate**.
4. Refresh the page.

Say:

> Activation starts the customer's service lifecycle. The subscription is now
> eligible for recurring billing when its next billing date arrives.

Expected result:

- Subscription status: `ACTIVE`
- Next billing date is visible
- Plan policies are visible
- Activation is recorded in subscription history

Do not claim that activation means payment has been completed. Payment happens
after an invoice is generated.

## 8. Generate the invoice

For a demonstration that produces an invoice immediately, use a seeded
subscription whose billing date is due. Then either:

### Option A: Admin button

1. Sign in as Admin in the Admin browser window.
2. Open `/admin/dashboard`.
3. Click **Run Recurring Billing**.
4. Show the processing result.

### Option B: Worker command

In a separate terminal, run:

```powershell
npm run worker
```

Explain:

> Recurring billing is a one-time run when this command or button is used. In
> production, a scheduler would run the worker automatically at a regular
> interval.

Expected result:

- An invoice is created for each due active subscription
- The subscription next billing date advances
- Billing history is recorded
- An invoice email is attempted
- An already processed billing period is not invoiced twice

If no subscription is due, the result may show zero processed. In that case,
show an existing seeded invoice or use a seeded due subscription for the
recording.

## 9. Show the unpaid invoice

1. Sign in as Staff.
2. Open `/staff/invoices`.
3. Locate the generated invoice.

Show:

- Invoice number
- Customer
- Invoice total
- Paid amount: `₹0`
- Outstanding amount: full invoice total
- Status: `CONFIRMED` or unpaid
- Due date

Say:

> Converting and activating a subscription does not mean the customer has
> already paid. The billing run creates an invoice with the full amount
> outstanding.

## 10. Customer: make a partial payment

1. Open the Customer browser window.
2. Open the invoice.
3. Enter a valid amount smaller than the invoice total.
4. Submit the payment.

Show:

- Payment success message
- Updated paid amount
- Reduced outstanding amount
- Invoice still not fully paid

Say:

> The customer can make a partial payment. BrightLoop updates the paid and
> outstanding balances without marking the invoice paid prematurely.

Example:

```text
Invoice total: ₹14,200
Partial payment: ₹5,000
Paid amount: ₹5,000
Outstanding amount: ₹9,200
Status: PARTIAL or CONFIRMED
```

## 11. Staff: complete payment and show receipt

1. Open `/staff/invoices`.
2. Select the same invoice.
3. Record the remaining balance.
4. Provide a transaction reference when required.
5. Submit the payment.
6. Generate or open the receipt PDF.

Show:

- Invoice status: `PAID`
- Paid amount equals invoice total
- Outstanding amount: `₹0`
- Successful payment record
- BrightLoop-branded receipt PDF

Say:

> Once the remaining balance is recorded, the invoice becomes fully paid.
> The system prevents overpayment, stores the transaction reference, records
> the payment audit trail, and generates a receipt.

## 12. Demonstrate validation

Optional but recommended:

1. Attempt a payment greater than the outstanding amount.
2. Show the rejection message.
3. Attempt a non-cash payment without a transaction reference.
4. Show the validation message.

Expected result:

- Payment is rejected
- Invoice totals do not change
- No invalid payment record is created

## 13. Show the same result in every role

### Staff view

Show:

- Customer history
- Subscription status
- Invoice status
- Payment amount
- Receipt action

### Customer view

Show:

- Accepted quotation
- Active subscription
- Invoice balance
- Payment history

### Admin view

Show:

- Dashboard metrics
- Recurring billing result
- Invoice and subscription records
- Billing operations

Say:

> The same persisted business result is visible according to each role's
> permissions. Staff operates the workflow, Customer uses self-service
> actions, and Admin monitors and configures the system.

## 14. Email evidence

After an email-producing action:

1. Check the recipient inbox.
2. Open Prisma Studio:

   ```powershell
   npx prisma studio
   ```

3. Open the `AuditLog` table.
4. Find the latest email record.

Show one of:

```text
EMAIL_SENT
EMAIL_SKIPPED_NOT_CONFIGURED
EMAIL_DELIVERY_FAILED
```

For a successful record, show the `to` value and subject. Do not show the
Brevo API key or any secret environment variable in the recording.

## 15. Closing statement

Say:

> The completed BrightLoop flow is quotation, customer acceptance,
> subscription conversion, activation, recurring invoice generation, payment
> reconciliation, and receipt generation. Each operation is persisted,
> validated, audited, and displayed according to the user's role.

## Final expected flow

```text
Staff creates quotation
→ Customer receives and accepts quotation
→ Staff converts quotation
→ Subscription becomes CONFIRMED
→ Staff activates subscription
→ Subscription becomes ACTIVE
→ Billing run creates unpaid invoice
→ Customer or Staff records payment
→ Partial balance is reconciled
→ Invoice becomes PAID
→ Receipt PDF is generated
→ Admin, Staff, and Customer see role-appropriate results
```
