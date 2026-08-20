# SunBeam Lodge Hotel Management System
COMP1682 Computing Project — Nathan Chellah (001561599)

Starter implementation matching the proposal's stack: **React.js + FastAPI + MySQL**,
with JWT-based RBAC (Objective 2), a reservation scheduler with conflict checking
(Objective 3), and a reporting module (Objective 5).

## Project structure
```
sunbeam-hms/
├── backend/
│   ├── app/
│   │   ├── core/         # DB connection, JWT + password hashing, RBAC dependency
│   │   ├── models/       # SQLAlchemy ORM models (staff, guest, room, reservation, payment)
│   │   ├── schemas/      # Pydantic request/response validation
│   │   ├── routers/      # auth, reservations, reports endpoints
│   │   └── main.py       # FastAPI app entrypoint
│   ├── database/schema.sql
│   ├── seed_data.py      # creates default admin + sample rooms
│   └── requirements.txt
└── frontend/
    ├── src/
    │   ├── pages/         # Login.jsx, Dashboard.jsx
    │   ├── components/    # ProtectedRoute.jsx
    │   ├── services/      # api.js (axios + JWT interceptor), AuthContext.jsx
    │   └── App.jsx
    └── package.json
```

## Backend setup

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

1. Create the MySQL database:
   ```bash
   mysql -u root -p < database/schema.sql
   ```
2. Set your DB connection string (or edit the default in `app/core/database.py`):
   ```bash
   export DATABASE_URL="mysql+pymysql://root:yourpassword@localhost/sunbeam_hms"
   ```
3. Seed an admin account + sample rooms:
   ```bash
   python seed_data.py
   ```
4. Run the API:
   ```bash
   uvicorn app.main:app --reload
   ```
   Interactive API docs: http://localhost:8000/docs

Default login (change immediately): `admin@sunbeamlodge.co.zm` / `ChangeMe123!`

## Frontend setup

```bash
cd frontend
npm install
npm start
```
Runs at http://localhost:3000 and talks to the API at http://localhost:8000.

## What's implemented vs. what's next

**Implemented (working scaffold):**
- JWT login (`/auth/login`) with bcrypt password hashing
- RBAC via `require_role()` — reports are Administrator-only, matching your proposal
- Reservation creation with **double-booking prevention** (date-overlap check at the DB query level)
- Check-in / check-out / cancel workflow that updates room status automatically
- Revenue, occupancy, and most-booked-room reports
- React login + dashboard with role-aware UI (non-admins don't see financial stats)

**Not yet built — good next sprints per your Agile plan:**
- Guest registration UI (backend schema/endpoint pattern is there; add a `guests` router the same way `reservations.py` is structured)
- Payments endpoint (model exists in `reservation.py`; needs a router)
- Geolocation module (Google Maps API integration — frontend-only addition)
- Staff management UI for creating new receptionist/admin accounts
- Automated tests (pytest for backend, matching your Testing Phase in Appendix B)

## Notes on design decisions
- **Password hashing**: bcrypt via passlib — never store plaintext passwords (relevant to your Data Protection Act 2021 discussion).
- **Conflict checking**: done with a SQL range-overlap query (`existing.check_in < new.check_out AND existing.check_out > new.check_in`) rather than trusting the frontend — this is the "real-time conflict resolution" your proposal describes.
- **RBAC**: implemented as a reusable FastAPI dependency (`require_role`) rather than checks scattered through each endpoint, so it's easy to point to in your dissertation as evidence of the Ferraiolo et al. (2001) least-privilege model.
