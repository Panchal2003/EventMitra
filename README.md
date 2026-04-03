# EventMitra

EventMitra is a full-stack event services platform scaffolded with a clean `frontend` and `backend` split. This implementation includes admin, service provider, and customer dashboards with a complete booking lifecycle from service request to OTP-verified completion and payout release.

## Stack

- Frontend: React + Vite, Tailwind CSS, Framer Motion
- Backend: Node.js, Express.js
- Database: MongoDB + Mongoose
- Auth: JWT with role-based access for `admin`, `serviceProvider`, and `customer`

## Project Structure

```text
EventMitra/
  backend/
    src/
      config/
      controllers/
      middleware/
      models/
      routes/
      seed/
      utils/
  frontend/
    src/
      components/
      context/
      hooks/
      layouts/
      pages/
      services/
      utils/
```

## Features Included

- JWT login and registration endpoints
- Role-based middleware for admin-only operations
- Admin dashboard metrics:
  - total bookings
  - total revenue
  - active service providers
  - pending approvals
  - pending payouts
- Service management:
  - add service categories
  - add service
  - edit service
  - delete service
  - set starting price and store service images
- Service provider management:
  - view providers
  - approve
  - reject
  - suspend
- Booking management:
  - view bookings
  - assign provider
  - change provider
  - cancel booking
- Payment management:
  - view payouts
  - release payout
- Responsive white-glass SaaS admin UI with reusable components
- Service provider dashboard:
  - profile setup with service category, experience, base price, and portfolio upload
  - booking request acceptance and rejection
  - start job and mark delivery complete
  - earnings overview with completed and pending payments
- Customer dashboard:
  - browse active services
  - create bookings that are stored for admin review
  - track booking status through assignment, provider acceptance, and delivery
  - enter OTP to complete the booking
- Booking flow enforcement:
  - customer books service
  - booking is stored in MongoDB
  - admin reviews and assigns a provider
  - provider accepts and starts work
  - provider marks the job complete
  - customer verifies with OTP
  - admin releases payout only after booking completion

## Setup

1. Install dependencies from the project root:

```bash
npm install
```

2. Copy environment files:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

3. Start MongoDB locally and update `backend/.env` if needed.

4. Seed demo data:

```bash
npm run seed
```

5. Start the app:

```bash
npm run dev
```

## Seeded Admin Login

- Email: `admin@eventmitra.com`
- Password: `Admin@123`

## Seeded Provider Login

- Email: `aarav.provider@eventmitra.com`
- Password: `Provider@123`

## Seeded Customer Login

- Email: `riya.customer@eventmitra.com`
- Password: `Customer@123`

## API Overview

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `GET /api/admin/dashboard`
- `GET /api/admin/services/categories`
- `POST /api/admin/services/categories`
- `GET /api/admin/services`
- `POST /api/admin/services`
- `PUT /api/admin/services/:serviceId`
- `DELETE /api/admin/services/:serviceId`
- `GET /api/admin/providers`
- `PATCH /api/admin/providers/:providerId/status`
- `GET /api/admin/bookings`
- `PATCH /api/admin/bookings/:bookingId/provider`
- `PATCH /api/admin/bookings/:bookingId/cancel`
- `GET /api/admin/payments`
- `PATCH /api/admin/payments/:paymentId/release`
- `GET /api/provider/dashboard`
- `GET /api/provider/service-categories`
- `GET /api/provider/profile`
- `PUT /api/provider/profile`
- `POST /api/provider/profile/portfolio`
- `GET /api/provider/bookings`
- `PATCH /api/provider/bookings/:bookingId/respond`
- `PATCH /api/provider/bookings/:bookingId/start`
- `PATCH /api/provider/bookings/:bookingId/complete`
- `GET /api/provider/earnings`
- `GET /api/customer/dashboard`
- `GET /api/customer/services`
- `POST /api/customer/bookings`
- `GET /api/customer/bookings`
- `PATCH /api/customer/bookings/:bookingId/verify-otp`

## Notes

- Admin accounts are intentionally not self-registerable from the public auth endpoint.
- Provider portfolio uploads are stored locally under `backend/uploads/portfolio` and served from `/uploads`.
- Services now store `name`, `category`, `description`, `startingPrice`, `image`, and a pricing note for future booking flows.
- Customer OTP verification is the final completion step before admin can release a provider payout.
- Services with linked bookings cannot be deleted and should be archived instead.
- Vite is configured to proxy `/api` requests to `http://localhost:5000` during development.
