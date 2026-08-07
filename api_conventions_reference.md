# Pragya Yog API — Architecture & Conventions Reference

This reference document outlines the global conventions, authentication protocols, and architectural specifications for the Pragya Yog PHP Backend API.

---

## 1. Global Conventions

- **Primary Entry Point**: `api.php`
- **Action Dispatching**: The target API operation is determined by the top-level request body field `"action"`.
- **HTTP Method**: All requests use `POST`.
  - Standard JSON requests: `Content-Type: application/json`
  - File/Receipt Uploads: `Content-Type: multipart/form-data`
- **Router Method Validation**: The router executes actions via `POST` dispatching without a per-action HTTP verb check.
- **Media & Upload Base URL**: `https://pragya-yog.com/uploads/`

---

## 2. Authentication & JWT Protocol

- **Token Transmission**: Protected actions utilize `verifyTokenAndRun()` and read the JWT directly from the request body parameter **`"token"`** (or `$_POST['token']` for `multipart/form-data`), *not* from the `Authorization: Bearer` HTTP header.
- **Token Error Responses**:
  - **Missing Token**: `HTTP 401` — `{"status": 401, "message": "Token missing"}`
  - **Invalid or Expired Token**: `HTTP 401` — `{"status": 401, "message": "Invalid or expired token"}`
- **JWT Claims**: Token issuance contains `email`, `iat` (issued at), and `exp` (expiration timestamp).

---

## 3. Domain Grouping & Endpoint Structure

Endpoints across the Pragya Yog system are grouped by functional domain:

### Domain Categories
1. **JWT & Auth Operations**: `login`, `check-token`, `reset-password`, `passwrod_change`, `register-device-token`, `unregister-device-token`
2. **Profile & Account Management**: `get-profile`, `edit_user_details`, `update-notification-settings`, `get-notification`, `del-notification`, `emergency-contact`, `wallet`
3. **Classes & Schedule**: `getClassByDate`, `today-class`, `publicClassByDate`, `get-booked-classes`, `classesTypeDetail`, `get-filters`
4. **Guest Booking & Reservations**: `guestBookingCheckEmail`, `guestBooking`, `guest_reserve_package`, `guest_reserve_bundle`
5. **Packages, Bundles & Passes**: `get-packages`, `get-package-detail`, `bundle-list`, `bundle-detail`, `bundle-track-event`, `reserve_package`, `reserve_bundle`
6. **Memberships & Billings**: `get-active-membership`, `renew-package`, `toggle-auto-renew`, `billings`, `upload-bank-receipt`
7. **Support & Studio Operations**: `ticketSubmit`, `get-ticket`, `get-user-checkin-qr`, `userCheckIn`, `checkInEligible`

---

## 4. Per-Endpoint Documentation Standard

Each action entry adheres to the following specification standard:

- **Action Name**: The `"action"` string passed in request payload.
- **Purpose**: Business objective of the endpoint.
- **HTTP Method**: `POST (application/json)` or `POST (multipart/form-data)`.
- **Authentication**: `Public`, `Optional`, or `JWT (verifyTokenAndRun)`.
- **Request Parameters**: Schema and required/optional flags.
- **Request & Response Examples**: JSON payload structures.
- **Core Logic**: Execution steps in PHP backend.
- **Database Tables Touched**: Primary SQL tables updated or queried (`users`, `schedule`, `packages`, `receipts`, `referrals`, etc.).
- **Validation Rules**: Mandatory constraints and status codes.
- **Security Considerations**: Rate limits, input sanitization, token validation.
- **Response Fields**: Field descriptions.
