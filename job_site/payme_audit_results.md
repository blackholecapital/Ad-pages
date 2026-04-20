# PAYME AUDIT RESULTS
## job_id: RB-INT-CHASSIS-004 | stage_4 | worker_a
## Scope: PayMe system completeness
## Target repo: https://github.com/blackholecapital/Biz-Pages-FB-frozen
## Audit date: 2026-04-16

---

## 1. PayMe payment card UI (invoice/payment form)

Status: **FOUND**

| File | Path | Notes |
|------|------|-------|
| `PayMeCheckout.tsx` | `payme-admin-minimal/payme-checkout-engine/components/PayMeCheckout.tsx` | Full checkout card (review order, summary, pay button) |
| `SinglePaymentPage.tsx` | `payme-admin-minimal/payme-checkout-engine/components/SinglePaymentPage.tsx` | One-off payment form |
| `PaymentRequestCard.tsx` | `payme-admin-minimal/payme-checkout-engine/components/PaymentRequestCard.tsx` | Payment-request tile |
| `PaymentMethodsShowcase.tsx` | `payme-admin-minimal/payme-checkout-engine/components/PaymentMethodsShowcase.tsx` | Apple Pay / Google Pay / Card / USDC selector |
| `InvoicePreviewCard.jsx` | `payme-admin-minimal/modules/light-crm/components/InvoicePreviewCard.jsx` | Invoice preview |
| `InvoiceGeneratorCard.jsx` | `payme-admin-minimal/modules/light-crm/components/InvoiceGeneratorCard.jsx` | Invoice generator form |
| `OpenInvoicesCard.jsx` | `payme-admin-minimal/modules/light-crm/components/OpenInvoicesCard.jsx` | Open-invoices list |
| `MemberBillingPanel.tsx` | `apps/product-shell/src/features/payme/MemberBillingPanel.tsx` | Customer-facing invoice/pay tile (wired to `usePayMeCart().show()`) |
| `types/payment-request.ts` | `payme-admin-minimal/payme-checkout-engine/types/payment-request.ts` | Payment-request type |
| `types/checkout.ts` | `payme-admin-minimal/payme-checkout-engine/types/checkout.ts` | Checkout type |

---

## 2. PayMe cart/basket component

Status: **FOUND**

| File | Path | Notes |
|------|------|-------|
| `BasketDemo.tsx` | `payme-admin-minimal/payme-checkout-engine/components/BasketDemo.tsx` | "Your basket" review UI with qty +/−, subtotal, estimated total, Proceed-to-checkout |
| `lib/basket.ts` | `payme-admin-minimal/payme-checkout-engine/lib/basket.ts` | Basket state / helpers |
| `config/basket.ts` | `payme-admin-minimal/payme-checkout-engine/config/basket.ts` | Basket config |
| `types/basket.ts` | `payme-admin-minimal/payme-checkout-engine/types/basket.ts` | Basket type |
| `PayMePanel.tsx` | `apps/product-shell/src/components/layout/PayMePanel.tsx` | Shell side panel that hosts the PayMe UI (cart-driven toggle) |
| `paymeCartState.tsx` | `apps/product-shell/src/state/paymeCartState.tsx` | `usePayMeCart` toggle context |

---

## 3. Coupon / discount module

Status: **FOUND**

| File | Path | Notes |
|------|------|-------|
| `CouponField.tsx` | `payme-admin-minimal/payme-checkout-engine/components/CouponField.tsx` | Coupon-code input |
| `admin/coupons.tsx` | `payme-admin-minimal/payme-checkout-engine/admin/coupons.tsx` | Admin CRUD for coupons |
| `lib/coupons.ts` | `payme-admin-minimal/payme-checkout-engine/lib/coupons.ts` | Coupon logic (apply/calc) |
| `types/coupon.ts` | `payme-admin-minimal/payme-checkout-engine/types/coupon.ts` | Coupon type |
| `pages/api/coupons/index.ts` | `payme-admin-minimal/payme-checkout-engine/pages/api/coupons/index.ts` | Coupon list/create API |
| `pages/api/coupons/validate.ts` | `payme-admin-minimal/payme-checkout-engine/pages/api/coupons/validate.ts` | Coupon validation API |

---

## 4. Recurring billing (PayMe Pro)

Status: **FOUND**

| File | Path | Notes |
|------|------|-------|
| `admin/subscriptions.tsx` | `payme-admin-minimal/payme-checkout-engine/admin/subscriptions.tsx` | Admin subscriptions dashboard |
| `lib/subscriptions.ts` | `payme-admin-minimal/payme-checkout-engine/lib/subscriptions.ts` | Subscription logic |
| `types/subscription.ts` | `payme-admin-minimal/payme-checkout-engine/types/subscription.ts` | Subscription type |
| `RecurringBillingCard.jsx` | `payme-admin-minimal/modules/light-crm/components/RecurringBillingCard.jsx` | Recurring billing card (light CRM) |
| `lib/stripe.ts` | `payme-admin-minimal/payme-checkout-engine/lib/stripe.ts` | Stripe adapter (referenced by recurring flow) |
| `admin/payment-requests.tsx` | `payme-admin-minimal/payme-checkout-engine/admin/payment-requests.tsx` | Includes recurring payment-request surface |

Notes:
- "PayMe Pro" brand label not present as a literal token, but the recurring/pro
  billing feature set (subscriptions, recurring card, stripe adapter) is present
  under the paths above.

---

## 5. PayMe admin control panel

Status: **FOUND**

| File | Path | Notes |
|------|------|-------|
| `admin/coupons.tsx` | `payme-admin-minimal/payme-checkout-engine/admin/coupons.tsx` | Coupons admin surface |
| `admin/payment-requests.tsx` | `payme-admin-minimal/payme-checkout-engine/admin/payment-requests.tsx` | Payment-requests admin surface |
| `admin/settings.tsx` | `payme-admin-minimal/payme-checkout-engine/admin/settings.tsx` | PayMe settings |
| `admin/subscriptions.tsx` | `payme-admin-minimal/payme-checkout-engine/admin/subscriptions.tsx` | Subscriptions admin |
| `LightCrmAdmin.jsx` | `payme-admin-minimal/modules/light-crm/components/LightCrmAdmin.jsx` | Light-CRM admin composition |
| `CompanyProfileCard.jsx` | `payme-admin-minimal/modules/light-crm/components/CompanyProfileCard.jsx` | Admin company profile |
| `CustomersCard.jsx` | `payme-admin-minimal/modules/light-crm/components/CustomersCard.jsx` | Admin customers card |
| `TxHistoryCard.jsx` | `payme-admin-minimal/modules/light-crm/components/TxHistoryCard.jsx` | Admin transaction history |
| `hooks/useLightCrm.js` | `payme-admin-minimal/modules/light-crm/hooks/useLightCrm.js` | CRM admin hook |
| `services/crmLocalStore.js` | `payme-admin-minimal/modules/light-crm/services/crmLocalStore.js` | CRM admin local-store persistence |
| `src/services/adminStore.js` | `payme-admin-minimal/src/services/adminStore.js` | PayMe admin store |
| `lib/spine/registry/adminModules.js` | `payme-admin-minimal/lib/spine/registry/adminModules.js` | Admin module registry (js) |
| `lib/spine/registry/adminModules.jsx` | `payme-admin-minimal/lib/spine/registry/adminModules.jsx` | Admin module registry (jsx) |
| `PayMeAdminPanel.tsx` | `apps/product-shell/src/features/payme/PayMeAdminPanel.tsx` | Shell integration — admin cards |
| `PayMeAdminCard.tsx` | `apps/product-shell/src/features/payme/PayMeAdminCard.tsx` | Single admin card primitive |
| `admin-bridge-contract.ts` | `packages/runtime-bridge/src/admin-bridge-contract.ts` | `payme_admin_registered` bridge flag |

---

## 6. Payment functions / API handlers

Status: **FOUND** (under `payme-admin-minimal/payme-checkout-engine/pages/api/`, not under `apps/product-shell/functions/api/`)

| File | Path | Notes |
|------|------|-------|
| `pages/api/coupons/index.ts` | `payme-admin-minimal/payme-checkout-engine/pages/api/coupons/index.ts` | Coupon CRUD |
| `pages/api/coupons/validate.ts` | `payme-admin-minimal/payme-checkout-engine/pages/api/coupons/validate.ts` | Coupon validate |
| `pages/api/stripe/create-checkout-session.ts` | `payme-admin-minimal/payme-checkout-engine/pages/api/stripe/create-checkout-session.ts` | Stripe checkout session |
| `pages/api/stripe/webhook.ts` | `payme-admin-minimal/payme-checkout-engine/pages/api/stripe/webhook.ts` | Stripe webhook |
| `pages/api/usdc/verify-payment.ts` | `payme-admin-minimal/payme-checkout-engine/pages/api/usdc/verify-payment.ts` | USDC verification |
| `lib/paymentRequests.ts` | `payme-admin-minimal/payme-checkout-engine/lib/paymentRequests.ts` | Payment-request ops |
| `lib/usdc.ts` | `payme-admin-minimal/payme-checkout-engine/lib/usdc.ts` | USDC helpers |
| `lib/usdcFees.ts` | `payme-admin-minimal/payme-checkout-engine/lib/usdcFees.ts` | USDC fee calc |
| `lib/stripe.ts` | `payme-admin-minimal/payme-checkout-engine/lib/stripe.ts` | Stripe client |
| `lib/storage.ts` | `payme-admin-minimal/payme-checkout-engine/lib/storage.ts` | Storage layer |
| `lib/eventLog.ts` | `payme-admin-minimal/payme-checkout-engine/lib/eventLog.ts` | Event log |
| `lib/crm.ts` | `payme-admin-minimal/payme-checkout-engine/lib/crm.ts` | CRM layer |
| `services/usdcTransfer.js` | `apps/modules/payme/src/services/usdcTransfer.js` | Shell-side USDC transfer stub |
| `utils/usdc.ts` | `apps/product-shell/src/utils/usdc.ts` | Shell-side USDC send helper |

---

## SEARCH-PATH COVERAGE MATRIX

| Path | Exists | PayMe artefacts present |
|------|--------|------------------------|
| `apps/modules/payme/` | YES | `src/App.jsx`, `src/index.jsx`, `src/main.jsx`, `src/services/usdcTransfer.js`, `src/styles/*`, `vite.config.js`, `package.json` |
| `apps/product-shell/src/features/payme/` | YES | `MemberBillingPanel.tsx`, `PayMeAdminCard.tsx`, `PayMeAdminPanel.tsx` |
| `apps/product-shell/src/components/` | YES | `layout/PayMePanel.tsx`, `integrations/ModuleFrame.tsx`, `integrations/moduleRegistry.ts` (payme route), `nav/TopNav.tsx` (cart toggle) |
| `functions/api/` | — | Not present at repo root |
| `apps/product-shell/functions/api/` | YES | No PayMe handlers (only `microfrontend-bootstrap.js`, `page.js`, `published-manifest.js`, `published-page.js`); PayMe handlers live under `payme-admin-minimal/payme-checkout-engine/pages/api/` |
| `packages/runtime-bridge/` | YES | `src/admin-bridge-contract.ts` declares `payme_admin_registered` |
| `packages/session-transport/` | YES | No PayMe-specific symbols; generic transport contract only |
| `payme-admin-minimal/` | YES (operator hint) | Full checkout engine (`payme-checkout-engine/`), light-crm (`modules/light-crm/`), admin store (`src/services/adminStore.js`), spine registry (`lib/spine/registry/adminModules.{js,jsx}`) |

---

## SUMMARY

| Category | Status |
|----------|--------|
| PayMe payment card UI (invoice/payment form) | **FOUND** |
| PayMe cart/basket component | **FOUND** |
| Coupon / discount module | **FOUND** |
| Recurring billing (PayMe Pro) | **FOUND** |
| PayMe admin control panel | **FOUND** |
| Payment functions / API handlers | **FOUND** (under `payme-admin-minimal/payme-checkout-engine/pages/api/`, not under shell `functions/api/`) |

No category returned MISSING. The shell `apps/product-shell/functions/api/` directory contains no PayMe-specific Cloudflare handlers; PayMe API handlers are consolidated under `payme-admin-minimal/payme-checkout-engine/pages/api/`.
