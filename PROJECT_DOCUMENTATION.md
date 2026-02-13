# UniRooms Project Documentation

> Date: February 13, 2026

This document provides a detailed, English-language description of the project structure and the contents of each file, grouped by **Frontend**, **Backend**, and **Database**.

---

## 1) Frontend (HTML/CSS/JavaScript SPA)

### 1.1 Structure

```
frontend/
  index.html
  css/
    styles.css
  js/
    admin.js
    api.js
    app.js
    auth.js
    config.js
    dashboard.js
    rooms.js
```

### 1.2 File-by-file Description

#### [frontend/index.html](frontend/index.html)

- Main entry point for the SPA.
- Loads CSS and all JavaScript modules in order:
  - `config.js`, `auth.js`, `api.js`, `rooms.js`, `admin.js`, `app.js`.
- Contains only the root container (`#app`) for the dynamic UI.

#### [frontend/css/styles.css](frontend/css/styles.css)

- Global styling for the SPA.
- Includes layout, typography, buttons, cards, admin panel styling, time-slot tables, and responsiveness.

#### [frontend/js/config.js](frontend/js/config.js)

- Central API base URL configuration.
- Utility functions:
  - `getToken()`, `getCurrentUser()`, `isLoggedIn()`, `logout()`.
- Handles localStorage token/user storage and logout redirection.

#### [frontend/js/auth.js](frontend/js/auth.js)

- Renders login/register UI and handles authentication.
- Registration limits role selection to **student** and **teacher** only.
- `handleLogin()` and `handleRegister()` call the backend via `API.auth.*`.

#### [frontend/js/api.js](frontend/js/api.js)

- Centralized fetch wrapper for API requests with JWT token support.
- Provides grouped API helpers:
  - `auth.login`, `auth.register`, `auth.deleteUser` (disable account).
  - `rooms.getAll`, `rooms.getById`, `rooms.create`, `rooms.delete`.
  - `bookings.create`, `bookings.getMyBookings`, `bookings.getRoomBookings`, `bookings.cancel`, `bookings.override`.

#### [frontend/js/app.js](frontend/js/app.js)

- App initialization and SPA navigation.
- Chooses between Login view and Dashboard view depending on auth state.
- Renders dashboard layout, sidebar navigation, and role-based access (admin panel).
- Handles **My Bookings** view and cancellation.

#### [frontend/js/rooms.js](frontend/js/rooms.js)

- Room listing and booking UI.
- Filtering (room type + search) and room cards.
- Booking form and time-slot selection logic.
- Client-side validation:
  - Consecutive time slots only
  - Students max 2 hours
  - Past times are blocked
- Calls backend booking endpoints and displays booking results.

#### [frontend/js/admin.js](frontend/js/admin.js)

- Admin panel UI for managing users and rooms.
- User list with **Disable** action (no deletion).
- Room management: add/delete rooms.
- Highlights sidebar nav when admin panel is active.

#### [frontend/js/dashboard.js](frontend/js/dashboard.js)

- (If present) additional dashboard-related functions; otherwise reserved for expansion.

---

## 2) Backend (Node.js + Express)

### 2.1 Structure

```
backend/
  server.js
  package.json
  setup-database.js
  config/
    database.js
  middleware/
    auth.js
  models/
    BaseSchedule.js
    Booking.js
    Room.js
    User.js
  routes/
    auth.js
    bookings.js
    rooms.js
```

### 2.2 File-by-file Description

#### [backend/server.js](backend/server.js)

- Express application entry point.
- Loads environment variables and connects to MongoDB.
- Mounts API routes: `/api/auth`, `/api/bookings`, `/api/rooms`.
- Exposes root endpoint for health/status.

#### [backend/package.json](backend/package.json)

- Backend dependencies:
  - `express`, `mongoose`, `bcrypt`, `jsonwebtoken`, `cors`, `dotenv`.

#### [backend/setup-database.js](backend/setup-database.js)

- One-time database seed script.
- Creates **admin**, **teacher**, and **student** users.
- Populates demo rooms.
- Intended to be run manually to set up initial data.

#### [backend/config/database.js](backend/config/database.js)

- Mongoose connection helper using `MONGODB_URI` from `.env`.
- Handles connection errors.

#### [backend/middleware/auth.js](backend/middleware/auth.js)

- Authentication and authorization middleware:
  - `authenticate`: verifies JWT token.
  - `isAdmin`: restricts admin routes.
  - `isTeacher`: restricts teacher routes.

#### [backend/models/User.js](backend/models/User.js)

- User schema:
  - `username`, `email`, `password_hash`, `role`, `isActive`, `createdAt`.
- Roles: `student`, `teacher`, `admin`.
- `isActive` controls login access (disabled accounts).

#### [backend/models/Room.js](backend/models/Room.js)

- Room schema:
  - `roomNumber`, `capacity`, `type`, `features`.
- Includes index for filtering by type + capacity.

#### [backend/models/Booking.js](backend/models/Booking.js)

- Booking schema:
  - `room_id`, `user_id`, `startTime`, `endTime`, `status`, `overriddenBy`.
- Indexes for conflict detection and user history.

#### [backend/models/BaseSchedule.js](backend/models/BaseSchedule.js)

- Base schedule schema (official classes).
- Fields: `room_id`, `subject`, `dayOfWeek`, `startTime`, `endTime`, `semester`.

#### [backend/routes/auth.js](backend/routes/auth.js)

- Authentication routes:
  - `POST /auth/register`: creates student/teacher accounts only.
  - `POST /auth/login`: returns JWT; blocks disabled accounts.
  - `GET /auth/users`: admin-only list of users.
  - `DELETE /auth/users/:id`: admin-only disable user.

#### [backend/routes/rooms.js](backend/routes/rooms.js)

- Room routes:
  - `GET /rooms`: list rooms (authenticated).
  - `GET /rooms/:id`: get single room.
  - `POST /rooms`: admin-only create.
  - `PUT /rooms/:id`: admin-only update.
  - `DELETE /rooms/:id`: admin-only delete.

#### [backend/routes/bookings.js](backend/routes/bookings.js)

- Booking logic and business rules:
  - Students: max 2 hours per booking.
  - Teachers/Admin can override student bookings.
  - BaseSchedule blocks bookings.
  - Past time slots are rejected.
- Routes:
  - `POST /bookings`: create booking.
  - `GET /bookings/my-bookings`: current user’s bookings.
  - `GET /bookings/room/:id`: availability by room/day.
  - `DELETE /bookings/:id`: cancel booking.

---

## 3) Database (MongoDB)

### 3.1 Collections

#### Users

- **Fields:** `_id`, `username`, `email`, `password_hash`, `role`, `isActive`, `createdAt`.
- **Roles:** `student`, `teacher`, `admin`.
- **Notes:** `isActive = false` disables login without deleting data.

#### Rooms

- **Fields:** `_id`, `roomNumber`, `capacity`, `type`, `features`.
- **Type enum:** `normal`, `lab`, `lecture_hall`, `conference`.

#### Bookings

- **Fields:** `_id`, `room_id`, `user_id`, `startTime`, `endTime`, `status`, `overriddenBy`.
- **Status enum:** `confirmed`, `cancelled`, `overridden`.

#### BaseSchedule

- **Fields:** `_id`, `room_id`, `subject`, `dayOfWeek`, `startTime`, `endTime`, `semester`.

### 3.2 Relationships

- `Bookings.room_id` → `Rooms._id`
- `Bookings.user_id` → `Users._id`
- `Bookings.overriddenBy` → `Users._id` (optional)
- `BaseSchedule.room_id` → `Rooms._id`

---

## 4) High-Level Flow Summary

1. **Login/Register** in the frontend via `/api/auth/*`.
2. **Dashboard** displays role-based navigation.
3. **Rooms & Schedule** shows availability and allows bookings.
4. **Bookings** enforce business rules (duration, overrides, base schedule, no past times).
5. **Admin Panel** manages users (disable) and rooms (CRUD).

---

## 5) Appendix: Python + Excalidraw

```
Python Script & Excalidraw/
  UniRoom_Architecture.excalidraw
  UniRoom_Database_Architecture.excalidraw
  generateDoc.py
  dbGenDoc.py
```

- [Python Script & Excalidraw/UniRoom_Architecture.excalidraw](Python%20Script%20%26%20Excalidraw/UniRoom_Architecture.excalidraw)
- [Python Script & Excalidraw/UniRoom_Database_Architecture.excalidraw](Python%20Script%20%26%20Excalidraw/UniRoom_Database_Architecture.excalidraw)
- [Python Script & Excalidraw/generateDoc.py](Python%20Script%20%26%20Excalidraw/generateDoc.py): Word document generator for project summary.
- [Python Script & Excalidraw/dbGenDoc.py](Python%20Script%20%26%20Excalidraw/dbGenDoc.py): Word document generator for DB schema documentation.

---

## 6) Security & Admin Constraints

- **Admin account creation** is restricted to `backend/setup-database.js`.
- Registration UI only allows **student** and **teacher** roles.
- Admins can **disable** user accounts to prevent login while keeping bookings.

---

End of document.
