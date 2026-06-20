# Ticket Booking App

A full-stack MERN event ticket booking system with seat reservation, countdown timer, and booking confirmation.

---

## Project Structure

```
TicketBooking/
├── backend/
│   ├── config/db.js
│   ├── middleware/auth.js
│   ├── models/          (User, Event, Seat, Reservation)
│   ├── routes/          (auth, events, reservations, bookings)
│   ├── seed.js
│   ├── server.js
│   └── .env
└── frontend/
    └── src/
        ├── context/AuthContext.js
        ├── components/  (Navbar, SeatGrid, CountdownTimer)
        ├── pages/       (AuthPage, EventsPage, EventDetailPage)
        ├── api.js
        └── App.js
```

## Running the Backend

```
cd backend
npm install
npm run dev         # Starts on http://localhost:5000
```

---

## Running the Frontend

```
cd frontend
npm install
npm start           # Opens http://localhost:3000
```

---

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /api/auth/register | No | Register user |
| POST | /api/auth/login | No | Login user |
| GET | /api/events | Yes | List all events |
| GET | /api/events/:id | Yes | Event + seats |
| POST | /api/reserve | Yes | Reserve seats (10 min) |
| POST | /api/bookings | Yes | Confirm booking |

---

## Assumptions

- Users must register/login before viewing events or booking.
- An event and its seats are created together via `POST /api/events` or the seed script.
- Seats are named S01, S02, ... S30 (auto-generated based on totalSeats).
- One reservation per request; a user can have multiple reservations for different events.
- MongoDB Atlas M0 free tier is used for development (supports transactions via replica set).

---

## Design Decisions

### Double Booking Prevention
MongoDB **transactions** are used in both `/api/reserve` and `/api/bookings`. The reservation flow:
1. Within a transaction, query seats WHERE status = 'available' AND seatNumber IN [selected]
2. If count doesn't match requested count → abort → return conflict error with unavailable seat list
3. Atomically update matching seats to 'reserved'
4. Create the Reservation document

This ensures two concurrent users cannot reserve the same seat simultaneously.

### Reservation Expiry
- `expiresAt` is set to `Date.now() + 10 minutes` at creation time
- A **MongoDB TTL index** on `expiresAt` auto-deletes expired reservations from the database
- The booking endpoint explicitly checks `expiresAt < now` and rejects expired reservations
- The frontend CountdownTimer mirrors this and resets the UI on expiry

### State Management
All state is managed via React's `useState` and `useEffect` hooks:
- `AuthContext` handles global auth state (user, token) persisted in localStorage
- `EventDetailPage` manages local state: seats, selectedSeats, reservation, step (SELECT → RESERVED → BOOKED)
- No external state library needed for this scope

### Component Architecture
- `Navbar` — persistent header with user info
- `SeatGrid` — pure presentational component, receives seats + selection state as props
- `CountdownTimer` — self-contained timer, calls `onExpire` callback when done
- `AuthPage` → `EventsPage` → `EventDetailPage` — page-level components driven by `selectedEventId` state in `App.js`
