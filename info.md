# 🏗️ Product Rental App — Full Project Blueprint

> **Stack:** MERN (MongoDB, Express, React, Node.js) + Stripe + JWT  
> **Purpose:** Portfolio project to demonstrate full stack skills  
> **Roles:** Customer | Owner | Admin

---

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [User Roles & Permissions](#user-roles--permissions)
3. [Core Business Flows](#core-business-flows)
4. [Rental Status Lifecycle](#rental-status-lifecycle)
5. [Stripe Integration Breakdown](#stripe-integration-breakdown)
6. [Notification Triggers](#notification-triggers)
7. [Database Schema Design](#database-schema-design)
8. [Collection Relationship Map](#collection-relationship-map)
9. [Build Order](#build-order)

---

## 🗺️ Project Overview

A general marketplace rental platform where owners list items for rent, customers book and pay for them, and admin manages the platform — taking a commission from each rental.

**Key Features:**

- 3-role authentication (JWT + Refresh Tokens)
- Forgot password via email OTP (nodemailer + bcrypt hashed OTP)
- Item listings with flexible pricing (per hour / day / week)
- Rental booking with owner approval flow
- Stripe payments with deposit hold/release
- Stripe Connect for owner payouts with platform commission
- Late fee auto-calculation
- Damage dispute resolution by admin
- In-app notifications + email notifications
- Customer reviews on items/owners
- Admin dashboard with commission reports
- Cron job for notification archiving

---

## 👥 User Roles & Permissions

### Customer

- Register / Login (JWT)
- Browse, search, filter listings
- Request a rental (select dates + handover method)
- Pay rental fee + security deposit via Stripe
- Track rental status
- Review item/owner after rental is completed

### Owner

- Register / Login (JWT)
- Create, edit, delete listings (pricing per hour/day/week)
- Set delivery availability + delivery fee
- Approve or reject rental requests
- Mark item as returned
- Flag item as damaged after return with photos + proposed amount
- View earnings dashboard

### Admin

- View and manage all users, listings, rentals
- Approve or suspend listings and users
- Review damage disputes and approve/reject deduction amounts
- View platform commission reports

---

## 🔄 Core Business Flows

### Flow 1 — Listing Creation

```
Owner creates listing
        ↓
Admin reviews listing
        ↓
Admin approves → Listing goes live
Admin rejects  → Owner notified with adminNote reason
```

### Flow 2 — Rental Request & Booking

```
Customer selects item + dates + handover method
        ↓
Customer pays upfront via Stripe
(rental amount + security deposit held)
        ↓
Owner gets notified of new request
        ↓
Owner approves → Rental becomes ACTIVE
Owner rejects  → Customer refunded
```

### Flow 3 — Active Rental

```
Item handed over (pickup or delivery)
        ↓
Rental period runs
        ↓
System tracks end date for late detection
```

### Flow 4 — Normal Return & Settlement

```
Owner marks item as returned (no damage)
        ↓
Rental status → RETURNED
        ↓
Security deposit released back to customer (Stripe)
Rental amount - platform commission → transferred to owner (Stripe Connect)
        ↓
Rental status → COMPLETED
Customer can now leave a review
```

### Flow 5 — Late Return

```
System detects actualReturnDate > endDate
        ↓
isLate flag set to true
        ↓
Late fee calculated (extra hours/days × rate)
        ↓
Late fee deducted from security deposit automatically
        ↓
Remainder of deposit refunded to customer
```

### Flow 6 — Damage Dispute

```
Owner flags damage after return
Owner uploads damage photos + proposes deduction amount
        ↓
Dispute document created (status: pending)
Admin gets notified
        ↓
Admin reviews evidence on dashboard
        ↓
Admin APPROVES                Admin REJECTS
        ↓                            ↓
damageAmountApproved          Full deposit released
deducted from deposit          to customer
        ↓
Remainder refunded to customer
        ↓
Both owner + customer notified of resolution
```

### Flow 7 — Reviews

```
Rental status = COMPLETED
        ↓
Customer can leave rating (1-5) + comment + photos
        ↓
listing.averageRating recalculated
owner.averageRating recalculated
isReviewed flag set to true on rental (prevents duplicate)
```

### Flow 8 — Forgot Password (OTP)

```
User clicks "Forgot Password" on frontend
        ↓
POST /auth/forgot-password → user submits email
        ↓
Backend finds user by email → not found → 404
        ↓
Generate 6-digit OTP
Hash OTP with bcrypt before saving
Save hashed OTP + expiry (now + 10 minutes) to user document
        ↓
Send plain OTP to user's email via nodemailer
        ↓
POST /auth/reset-password → user submits email + OTP + new password
        ↓
Find user by email
Is OTP expired? → Date.now() > passwordResetOTPExpiry → 400
bcrypt.compare(submittedOTP, user.passwordResetOTP) → no match → 400
        ↓
Update password → pre-save hook hashes it automatically
Clear OTP fields → set passwordResetOTP and passwordResetOTPExpiry to null
        ↓
Return 200 → "Password reset successful"
```

---

## 🚦 Rental Status Lifecycle

```
pending → approved → active → returned → completed
    ↓                              ↓
rejected                      cancelled
                                   ↓
                              disputed → resolved
```

| Status      | Meaning                                             |
| ----------- | --------------------------------------------------- |
| `pending`   | Customer requested, waiting for owner approval      |
| `approved`  | Owner accepted the rental request                   |
| `rejected`  | Owner declined the request                          |
| `active`    | Item is with the customer                           |
| `returned`  | Owner marked item back — deposit settlement pending |
| `completed` | Everything settled, rental fully closed             |
| `cancelled` | Cancelled before or during active period            |

---

## 💳 Stripe Integration Breakdown

| Feature                     | Stripe Mechanism                                       |
| --------------------------- | ------------------------------------------------------ |
| Rental payment              | Payment Intent (`capture_method: automatic`)           |
| Security deposit hold       | Payment Intent (`capture_method: manual`)              |
| Deposit release (no damage) | Cancel the uncaptured Payment Intent                   |
| Deposit partial deduction   | Partial capture of the held Payment Intent             |
| Owner payout                | Stripe Connect — Transfer to owner's connected account |
| Platform commission         | Deducted before Transfer to owner                      |
| Late fee charge             | Separate Payment Intent or partial deposit capture     |
| Refunds                     | Stripe Refund object (stripeRefundId stored)           |

### Commission Math Example

```
Customer pays:      $1000
Commission rate:    10%
Commission amount:  $100  → platform keeps
Owner earning:      $900  → transferred via Stripe Connect
```

### Test Mode Notes

- Use API key starting with `sk_test_...` in `.env`
- Test card: `4242 4242 4242 4242`
- Stripe Connect test accounts — no real KYC required
- Full payment flow testable end-to-end with no real money

---

## 🔔 Notification Triggers

| Event                        | Who Gets Notified |
| ---------------------------- | ----------------- |
| New rental request received  | Owner             |
| Rental request approved      | Customer          |
| Rental request rejected      | Customer          |
| Payment successful           | Customer + Owner  |
| Rental period expiring soon  | Customer + Owner  |
| Item marked as returned      | Customer          |
| Damage dispute raised        | Admin + Customer  |
| Damage dispute resolved      | Owner + Customer  |
| New listing pending approval | Admin             |
| Listing approved             | Owner             |
| Listing rejected             | Owner             |

---

## 🗄️ Database Schema Design

### 1. `users`

```
users
├── name                    (String, required)
├── email                   (String, required, unique)
├── password                (String, required, hashed)
├── phone                   (String)
├── profilePhoto            (String, URL)
├── role                    (Enum: "customer", "owner", "admin", default: "customer")
├── address                 (Object — owner and customer only)
│   ├── street              (String)
│   ├── city                (String)
│   ├── state               (String)
│   ├── pincode             (String)
│   └── country             (String)
├── isActive                (Boolean, default: true)
├── lastLoginAt             (Date)
├── refreshToken            (String, nullable — cleared on logout, select: false)
├── isVerifiedOwner         (Boolean, default: false — admin approves)
├── stripeConnectAccountId  (String, nullable — owners only)
├── averageRating           (Number, default: 0 — owners only)
├── totalEarnings           (Number, default: 0 — owners only)
├── passwordResetOTP        (String, nullable — bcrypt hashed OTP, select: false)
├── passwordResetOTPExpiry  (Date, nullable — OTP expires after 10 minutes)
└── timestamps              (createdAt, updatedAt — Mongoose auto)
```

**Key Notes:**

- Single collection for all 3 roles — `role` field separates them
- `password` required for all users — no Google OAuth
- `refreshToken` stored here — set to null on logout to invalidate session, `select: false` prevents leaking in responses
- Owner-only fields are null/undefined for customers and admins
- `averageRating` is denormalized — recalculate on every new review
- `passwordResetOTP` stores a **bcrypt hashed** version of the OTP — never store plain OTP
- `passwordResetOTPExpiry` set to `Date.now() + 10 minutes` on OTP generation — checked before verifying OTP
- `passwordResetVerified` prevents password reset without first verifying OTP — set to true after OTP verified, cleared after password reset

---

### 2. `categories`

```
categories
├── name        (String, required, unique)
├── icon        (String, a CSS icon class name (e.g. fa-car, lucide-home) — plain string, no file upload needed)
├── isActive    (Boolean, default: true)
└── timestamps  (createdAt, updatedAt)
```

**Key Notes:**

- Admin creates and manages categories from dashboard
- Listings reference categories by ObjectId
- `isActive: false` hides a category without deleting it

---

### 3. `listings`

```
listings
├── owner               (ObjectId, ref: "users", required)
├── category            (ObjectId, ref: "categories", required)
│
├── title               (String, required)
├── description         (String, required)
├── photos              (Array of Strings — Cloudinary image URLs)
├── condition           (Enum: "new", "good", "fair")
│
├── location
│   ├── address         (String)
│   ├── city            (String)
│   ├── state           (String)
│   └── pincode         (String)
│
├── pricing
│   ├── perHour         (Number, nullable — null means not available)
│   ├── perDay          (Number, nullable — null means not available)
│   └── perWeek         (Number, nullable — null means not available)
├── securityDeposit     (Number, required)
├── deliveryFee         (Number, default: 0)
├── isDeliveryAvailable (Boolean, default: false)
│
├── blockedDates        (Array of objects)
│   └── { from: Date, to: Date }
│
├── status              (Enum: "pending", "approved", "rejected", "suspended")
├── adminNote           (String, nullable — reason for rejection/suspension)
│
├── averageRating       (Number, default: 0)
├── totalReviews        (Number, default: 0)
│
└── timestamps          (createdAt, updatedAt)
```

**Key Notes:**

- `null` pricing field = that rent type is disabled (no separate rentType field needed)
- `blockedDates` updated when rental is approved, removed when rental is cancelled
- `status: "pending"` by default — admin must approve before listing goes live
- `adminNote` tells owner why their listing was rejected/suspended
- `averageRating` is denormalized — recalculate on every new review
- `isDeliveryAvailable` allows frontend to show "Delivery Available" badge
- `photos` stores Cloudinary URLs — files are never stored on the server

---

### 4. `rentals`

```
rentals
├── customer            (ObjectId, ref: "users")
├── owner               (ObjectId, ref: "users")
├── listing             (ObjectId, ref: "listings")
│
├── rentType            (Enum: "hour", "day", "week")
├── startDate           (Date, required)
├── endDate             (Date, required)
├── handoverMethod      (Enum: "pickup", "delivery")
│
├── priceSnapshot
│   ├── perHour         (Number, nullable)
│   ├── perDay          (Number, nullable)
│   ├── perWeek         (Number, nullable)
│   └── deliveryFee     (Number)
│
├── totalAmount         (Number)
├── securityDeposit     (Number)
├── lateFee             (Number, default: 0)
│
├── depositStatus       (Enum: "held", "released", "deducted")
│
├── actualReturnDate    (Date, nullable)
├── isLate              (Boolean, default: false)
├── isReviewed          (Boolean, default: false)
│
├── damageDescription       (String, nullable)
├── damagePhotos            (Array of Strings — Cloudinary image URLs)
├── damageAmountProposed    (Number, nullable — owner sets)
├── damageAmountApproved    (Number, nullable — admin sets)
│
├── status              (Enum: "pending", "approved", "rejected",
│                        "active", "returned", "completed", "cancelled")
│
├── payment             (ObjectId, ref: "payments")
│
└── timestamps          (createdAt, updatedAt)
```

**Key Notes:**

- `priceSnapshot` captures prices at booking time — protects against future price changes by owner
- `isReviewed` prevents duplicate reviews per rental
- `isLate` flag makes querying overdue rentals instant without date math
- Damage fields on rental + dispute collection work together for full resolution flow
- `depositStatus` tracks the Stripe deposit state independently of rental status

---

### 5. `payments`

```
payments
├── rental          (ObjectId, ref: "rentals")
├── user            (ObjectId, ref: "users")
│
├── type            (Enum: "rental_payment", "deposit_hold",
│                    "deposit_release", "deposit_deduct",
│                    "late_fee", "owner_payout")
├── amount          (Number, required)
├── currency        (String, default: "usd")
├── status          (Enum: "pending", "success", "failed")
│
├── stripePaymentIntentId   (String, nullable)
├── stripeTransferId        (String, nullable)
├── stripeRefundId          (String, nullable)
│
├── commissionRate      (Number, nullable)
├── commissionAmount    (Number, nullable)
├── ownerEarning        (Number, nullable)
│
├── refund
│   ├── isRefunded      (Boolean, default: false)
│   ├── refundAmount    (Number, nullable)
│   └── refundedAt      (Date, nullable)
│
└── timestamps          (createdAt, updatedAt)
```

**Key Notes:**

- One document per transaction — same pattern as a bank statement
- `type` field identifies what kind of transaction it is
- Commission fields only populated on `rental_payment` and `owner_payout` types
- `stripeRefundId` needed to track/dispute refunds on Stripe dashboard
- `user` stored directly (not derived from rental) because owner payouts also need a user reference
- Admin dashboard queries `SUM(commissionAmount)` for earnings reports

---

### 6. `reviews`

```
reviews
├── rental          (ObjectId, ref: "rentals")
├── customer        (ObjectId, ref: "users")
├── owner           (ObjectId, ref: "users")
├── listing         (ObjectId, ref: "listings")
│
├── rating          (Number, min: 1, max: 5, required)
├── comment         (String, required)
├── photos          (Array of Strings — Cloudinary image URLs)
│
└── timestamps      (createdAt, updatedAt)
```

**Key Notes:**

- Only allowed when `rental.status === "completed"`
- `rental.isReviewed` set to true after submission — prevents duplicates
- Both `owner` and `listing` stored directly for efficient querying
- After saving a review → recalculate `listing.averageRating`, `listing.totalReviews`, `owner.averageRating`

---

### 7. `notifications`

```
notifications
├── user            (ObjectId, ref: "users")
├── rental          (ObjectId, ref: "rentals")
│
├── title           (String, required)
├── message         (String, required)
├── type            (Enum: "booking", "payment",
│                    "dispute", "review", "system")
│
├── isRead          (Boolean, default: false)
├── isArchived      (Boolean, default: false)
│
└── timestamps      (createdAt, updatedAt)
```

**Key Notes:**

- Bell icon badge count = `notifications.find({ user, isRead: false, isArchived: false }).count`
- Mark all as read uses `updateMany({ user, isRead: false }, { $set: { isRead: true } })`
- Cron job (node-cron) runs every midnight → archives notifications older than 30 days
- Both customer and owner get separate notification documents for shared events

---

### 8. `disputes`

```
disputes
├── rental                  (ObjectId, ref: "rentals")
├── raisedBy                (ObjectId, ref: "users" — owner)
├── resolvedBy              (ObjectId, ref: "users" — admin, nullable)
│
├── damageAmountProposed    (Number, required)
├── damageAmountApproved    (Number, nullable)
├── adminNote               (String, nullable)
│
├── status                  (Enum: "pending", "approved", "rejected")
│
└── timestamps              (createdAt, updatedAt)
```

**Key Notes:**

- Evidence (photos + description) lives on the `rental` document — no duplication needed
- `resolvedBy` captures which admin handled the dispute
- On approval → deduct `damageAmountApproved` from deposit, refund remainder to customer
- On rejection → release full deposit back to customer
- Both owner and customer get notified on resolution via 2 notification documents

---

## 🔗 Collection Relationship Map

```
categories
     ↓
   users ──────────→ listings
     ↓                    ↓
     └────────→ rentals ←─┘
                    ↓
       ┌────────────┼─────────────┐
       ↓            ↓             ↓
   payments      reviews      disputes

       └────────────┼─────────────┘
                    ↓
             notifications
```

---

## 🚀 Build Order

### Phase 1 — Project Setup

- Initialize Node.js + Express backend
- Initialize React frontend (Vite)
- Setup folder structure (MVC pattern)
- Configure `.env.development` and `.env.example` files
- Connect MongoDB via Mongoose (`config/databaseConfig.js`)
- Setup modular config files:
  - `config/envConfig.js` — loads correct `.env` per environment, exports `envMode`
  - `config/corsConfig.js` — CORS options built from `CLIENT_URL` env var
  - `config/rateLimitConfig.js` — global rate limiter (100 req / 15 min)
- Setup environment variable validation on startup (`validators/validateEnvVariables.js`)
  - Crashes server intentionally if any required key is missing
- Register global middleware in `server.js` in this exact order:
  1. `helmet()` — HTTP security headers
  2. `cors(corsOptions)` — origin whitelist with credentials
  3. `globalRateLimiter` — throttle all routes
  4. `express.json()` — parse request body
  5. `cookieParser()` — parse cookies (required for HttpOnly refresh token)
  6. `mongoSanitize()` — strip `$` operators after body is parsed (@exortek/express-mongo-sanitize — Express 5 compatible)

### Phase 2 — Database Models

- Write all 8 Mongoose schemas and models
- Add indexes where needed (email unique, listing status, rental customer/owner)

### Phase 3 — Authentication APIs

- POST `/auth/register` — validate input, hash password, create user, return tokens
- POST `/auth/login` — verify password, return access + refresh tokens
- POST `/auth/refresh` — validate refresh token, rotate token, return new access token
- POST `/auth/logout` — clear refresh token from DB and cookie
- POST `/auth/forgot-password` — validate email, generate OTP, hash OTP, save to DB, send email
- POST `/auth/reset-password` — verify OTP, check expiry, update password, clear OTP fields
- Auth middleware — verify JWT access token, attach user to request
- Role guard middleware — `allowRoles("admin")`, `allowRoles("owner")` etc.
- Strict rate limiter on `/auth/login`, `/auth/register`, `/auth/forgot-password` (10 req / 15 min)

**New utility needed:**

```
utils/sendEmail.js ← exports generic sendEmail({ to, subject, html })
```

**New env vars needed:**

```
EMAIL_USER=yourgmail@gmail.com
EMAIL_PASS=your_gmail_app_password
```

**Gmail App Password setup:**

1. Enable 2FA on Gmail account
2. Google Account → Security → App Passwords
3. Generate one for "Mail" — use this as EMAIL_PASS, not your real Gmail password

**Route middleware order:**
verifyToken → allowRoles → validators → validateData → controller

### Phase 4 — Categories & Listings

- **CRUD for categories (admin only):**
  - GET /api/category → public, no auth, active categories only
  - GET /api/category/admin → admin only, all categories, optional ?status=active|inactive filter
  - POST /api/category → admin only, create
  - PUT /api/category/:id → admin only, update name/icon
  - PATCH /api/category/:id → admin only, toggle isActive

- POST `/listings` — owner creates listing (status: pending)
- GET `/listings` — public browse with filters (category, price, availability dates)
- GET `/listings/:id` — single listing detail
- PATCH `/listings/:id` — owner edits their listing (IDOR check: owner only)
- DELETE `/listings/:id` — owner deletes listing (IDOR check: owner only)
- PATCH `/listings/:id/status` — admin approves/rejects/suspends
- File upload via `multer` + `Cloudinary`:
  - Accept images only (jpeg, jpg, png, webp)
  - Max size: 5MB per file, max 10 files per request
  - Files uploaded to Cloudinary — URL stored in MongoDB, never store on server

### Phase 5 — Rental Booking Flow

- POST `/rentals` — customer creates rental request
- PATCH `/rentals/:id/approve` — owner approves (updates blockedDates on listing)
- PATCH `/rentals/:id/reject` — owner rejects
- PATCH `/rentals/:id/return` — owner marks item returned
- GET `/rentals` — list rentals (filtered by role)
- GET `/rentals/:id` — single rental detail (IDOR check: customer or owner only)

### Phase 6 — Stripe Integration

- Setup Stripe SDK and Stripe Connect
- Payment Intent for rental amount
- Manual capture Payment Intent for security deposit
- Stripe webhook handler (payment success, transfer events)
  - Webhook route registered before `express.json()` using `express.raw()`
  - Every webhook verified with `stripe.webhooks.constructEvent()`
- Owner payout via Stripe Connect Transfer
- Commission deduction logic
- Deposit release (cancel Payment Intent)
- Deposit partial capture (damage deduction)

### Phase 7 — Return, Late Fee & Damage Flow

- Late fee auto-calculation when `actualReturnDate > endDate`
- Deposit deduction logic for late fees
- POST `/disputes` — owner raises damage dispute
- PATCH `/disputes/:id/resolve` — admin approves or rejects
- Deposit settlement after dispute resolution
- Notify both parties on resolution

### Phase 8 — Reviews & Notifications

- POST `/reviews` — customer submits review (only if rental completed + not already reviewed)
- GET `/reviews/listing/:id` — all reviews for a listing
- Recalculate `averageRating` on listing and owner after each review
- GET `/notifications` — get user notifications (with isRead/isArchived filters)
- PATCH `/notifications/read-all` — mark all as read
- Setup node-cron job for 30-day archiving

### Phase 9 — Admin Dashboard APIs

- GET `/admin/users` — list all users with filters
- PATCH `/admin/users/:id/status` — activate/suspend user
- GET `/admin/listings` — all listings pending approval
- GET `/admin/rentals` — all rentals overview
- GET `/admin/disputes` — pending disputes queue
- GET `/admin/analytics` — total commissions, active rentals, revenue

### Phase 10 — Frontend (React)

- Setup React Router, Axios, Context API (or Redux) for auth state
- Pages: Home, Browse listings, Listing detail, My rentals, Dashboard
- Role-based routing (protected routes per role)
- Stripe frontend integration (Stripe.js, Elements)
- Notification bell component with real-time count
- Owner dashboard — listings management, earnings
- Admin dashboard — users, listings approval, disputes, analytics

---

## 📌 Key Technical Concepts to Know

| Concept                     | Where It's Used                                                |
| --------------------------- | -------------------------------------------------------------- | ----------------------------------------------------------------- |
| JWT access + refresh tokens | Auth flow                                                      |
| bcrypt                      | Password hashing + OTP hashing                                 |
| Refresh token rotation      | Detects stolen tokens, forces logout on reuse                  |
| nodemailer                  | Sends OTP email for forgot password flow                       |
| OTP expiry check            | Date.now() > passwordResetOTPExpiry → reject                   |
| IDOR protection             | Ownership check on every findById route                        |
| Stripe Payment Intents      | Rental payment                                                 |
| `capture_method: manual`    | Deposit hold                                                   |
| Stripe Connect + Transfers  | Owner payouts                                                  |
| Stripe webhook verification | Prevents spoofed payment events                                |
| Cloudinary                  | File storage — images uploaded here, URL in DB                 |
| multer                      | File upload middleware — type + size validation                |
| Denormalization             | averageRating on users + listings                              |
| Price snapshot              | Rental booking — freeze prices at booking time                 |
| node-cron                   | Notification archiving background job                          |
| Role-based middleware       | Protecting routes per role                                     |
| blockedDates array          | Listing availability tracking                                  |
| updateMany                  | Mark all notifications as read @exortek/express-mongo-sanitize | Strips MongoDB operators from request body (Express 5 compatible) |
| helmet                      | Sets secure HTTP headers automatically                         |

---

_This document was designed conversation-first — every decision was made deliberately for a portfolio-grade MERN project._
