# SunBeam Lodge Hotel Management System

**COMP1682 Computing Project — Nathan Chellah (001561599)**

SunBeam Lodge Hotel Management System is a web-based hotel management system developed using **React.js, FastAPI and MySQL**.

The system provides separate interfaces for hotel staff and customers. Staff users can manage guests, rooms, reservations, payments, check-in/check-out processes, staff accounts and reports. Customers can register, log in, check room availability, make reservations and submit payments.

The system uses **JWT-based authentication and role-based access control (RBAC)** for staff accounts, reservation conflict checking, payment management and reporting functionality.

---

## Technology Stack

### Frontend

* React.js 18
* React Router
* Axios
* Vite

### Backend

* FastAPI
* Uvicorn
* SQLAlchemy
* Pydantic
* MySQL
* PyMySQL
* JWT authentication
* Passlib / bcrypt

### Database

* MySQL

---

## Project Structure

```text
sunbeam-hms/

├── backend/
│   ├── app/
│   │   ├── core/
│   │   │   ├── database.py
│   │   │   └── security.py
│   │   │
│   │   ├── models/
│   │   │   ├── customer.py
│   │   │   ├── guest.py
│   │   │   ├── reservation.py
│   │   │   ├── room.py
│   │   │   └── staff.py
│   │   │
│   │   ├── schemas/
│   │   │
│   │   ├── routers/
│   │   │   ├── auth.py
│   │   │   ├── guests.py
│   │   │   ├── payments.py
│   │   │   ├── reports.py
│   │   │   ├── reservations.py
│   │   │   ├── rooms.py
│   │   │   └── staff.py
│   │   │
│   │   └── main.py
│   │
│   ├── database/
│   │   └── schema.sql
│   │
│   ├── seed_data.py
│   └── requirements.txt
│
└── frontend/
    ├── src/
    │   ├── components/
    │   ├── pages/
    │   ├── services/
    │   ├── App.jsx
    │   └── main.jsx
    │
    ├── package.json
    └── package-lock.json
```

---

# Backend Setup

## 1. Create and activate a Python virtual environment

From the project root:

### Windows PowerShell

```powershell
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
```

If PowerShell prevents activation, the backend can still be run using the Python executable inside the virtual environment.

### macOS / Linux

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
```

---

## 2. Install Python dependencies

```bash
pip install -r requirements.txt
```

---

## 3. Create the MySQL database

Make sure MySQL is installed and running.

The database schema is located at:

```text
backend/database/schema.sql
```

Run the schema using MySQL:

```bash
mysql -u root -p < database/schema.sql
```

Alternatively, the contents of `schema.sql` can be executed through MySQL Workbench.

The schema creates the `sunbeam_hms` database and the required tables, including:

* roles
* staff
* guests
* customers
* room_types
* rooms
* reservations
* payments

---

## 4. Configure the environment

Create a `.env` file inside the `backend` directory.

Example:

```text
DATABASE_URL=mysql+pymysql://root:yourpassword@localhost/sunbeam_hms
JWT_SECRET_KEY=replace-this-with-a-long-random-secret
```

The `DATABASE_URL` must match the MySQL username, password and database configured on the computer.

The JWT secret should be changed from the example value when deploying the application.

---

## 5. Seed initial data

From the `backend` directory:

```bash
python seed_data.py
```

The seed script creates:

* Administrator and Receptionist roles if they do not already exist
* A default Administrator account
* Sample room types
* Sample rooms

### Default Administrator

```text
Email: admin@sunbeamlodge.co.zm
Password: ChangeMe123!
```

The default password should be changed after the first login.

Customer accounts are **not** seeded. Customers create their own accounts through the customer registration portal.

---

## 6. Run the FastAPI backend

From the `backend` directory:

```bash
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000
```

For development, `--reload` may also be used:

```bash
python -m uvicorn app.main:app --reload
```

The API will be available at:

```text
http://localhost:8000
```

Interactive API documentation:

```text
http://localhost:8000/docs
```

---

# Frontend Setup

Open a second terminal.

From the project root:

```bash
cd frontend
npm install
```

Start the frontend:

```bash
npm start
```

The frontend will normally be available at:

```text
http://localhost:3000
```

The frontend communicates with the FastAPI backend running on port 8000.

---

# System Features

## Staff Authentication and RBAC

Staff users authenticate through the staff login system.

The system supports two staff roles:

* Administrator
* Receptionist

JWT tokens are used for authentication.

Role-based access control is implemented through reusable FastAPI dependencies.

Administrator-only functionality includes protected financial/reporting and staff-management operations where applicable.

---

## Customer Portal

Customers have a separate authentication system from staff.

Customers can:

* Register an account
* Log in
* Browse available rooms
* Select check-in and check-out dates
* Check room availability
* Make reservations
* View their reservations
* Submit payments
* Sign out

Customer accounts are linked to guest records through the `customers` table.

Customers cannot access reservations or payments belonging to other customers.

---

## Guest Management

Staff users can manage guest records through the staff portal.

Guest information includes:

* Full name
* Email
* Phone number
* ID number
* Nationality
* Address

---

## Room Management

The system supports:

* Room types
* Room numbers
* Room floors
* Room capacity
* Room pricing
* Room status

Room statuses include:

* Available
* Occupied
* Maintenance

Rooms under maintenance are excluded from customer availability searches.

---

## Reservation Management

Reservations contain:

* Guest
* Room
* Check-in date
* Check-out date
* Reservation status
* Total amount
* Actual check-in time
* Actual check-out time
* Staff member who created the reservation

Reservation statuses include:

* Booked
* Checked in
* Checked out
* Cancelled

The backend performs date-overlap conflict checking before creating a reservation.

The overlap condition is:

```text
existing check-in < new check-out
AND
existing check-out > new check-in
```

This prevents a room from being reserved for overlapping dates through the application.

The database also validates that the check-out date occurs after the check-in date.

---

## Payments

The system supports:

* Cash
* Card
* Mobile Money

Payment statuses include:

* Pending
* Paid
* Refunded

Staff users can:

* View payments
* Create payments
* Mark payments as paid
* Refund paid payments

The system validates:

* Payment amounts must be greater than zero
* Payments cannot exceed the outstanding reservation balance
* Cancelled reservations cannot receive payments
* Refunded payments cannot be marked as paid

Customer payments are submitted as **pending** because the current system does not connect to a live payment gateway.

A staff user can subsequently verify the payment and mark it as paid.

---

## Check-in and Check-out

Staff users can check guests into reservations and check them out.

When a guest checks in:

* Reservation status changes to `checked_in`
* Actual check-in time is recorded
* Room status changes to `occupied`

When a guest checks out:

* Reservation status changes to `checked_out`
* Actual check-out time is recorded
* Room status changes to `available`

---

## Reports and Dashboard

The system provides reporting functionality for hotel operations.

Reports include information relating to:

* Revenue
* Occupancy
* Reservations
* Most-booked rooms

The dashboard provides operational summaries to authorised staff users.

---

## Lodge Location

The system includes a lodge location section providing location information for the property.

---

# Database Design

The main database entities are:

```text
Roles
  │
  └── Staff

Guests
  │
  ├── Reservations
  │       │
  │       ├── Rooms
  │       └── Payments
  │
  └── Customers
```

A customer account is linked to a guest record.

Reservations continue to use the existing guest relationship, allowing customer-created reservations and staff-created reservations to use the same reservation system.

---

# Security Design

## Password Security

Passwords are never stored as plaintext.

The application uses bcrypt password hashing through Passlib.

## Authentication

JWT tokens are used for authenticated staff and customer sessions.

Staff and customer authentication use separate token handling and access dependencies.

## Role-Based Access Control

Staff permissions are controlled using reusable FastAPI dependencies rather than relying solely on frontend visibility.

Frontend restrictions are therefore supplemented by backend authorization.

## Customer Data Isolation

Customer-specific endpoints verify that the requested reservation or payment belongs to the authenticated customer's guest record.

This prevents customers from accessing another customer's booking information by changing an ID in an API request.

---

# Running the Complete System

Two terminals are normally required.

### Terminal 1 — Backend

```powershell
cd backend
.\venv\Scripts\Activate.ps1
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000
```

### Terminal 2 — Frontend

```powershell
cd frontend
npm install
npm start
```

Then open:

```text
http://localhost:3000
```

---

# Initial Login

### Staff

```text
Email: admin@sunbeamlodge.co.zm
Password: ChangeMe123!
```

### Customers

Customers register through the customer portal and then use their own credentials to log in.

---

# Project Status

The core implementation is complete.

### Implemented

* JWT authentication
* Staff RBAC
* Staff management
* Guest management
* Room and room-type management
* Reservation management
* Reservation conflict checking
* Customer registration and authentication
* Customer booking portal
* Customer reservation management
* Payment management
* Customer payment submission
* Payment validation
* Payment confirmation
* Payment refunds
* Check-in workflow
* Check-out workflow
* Revenue reporting
* Occupancy reporting
* Dashboard
* Lodge location
* Frontend validation and responsive UI

### Final Phase

The project is now moving into the **final testing and verification phase**.

Further feature development should only be undertaken if testing identifies a genuine functional problem or a requirement that has not been satisfied.

---

# Important Development Notes

* Do not commit the Python virtual environment (`backend/venv/`).
* Do not commit generated Python cache files.
* Do not commit `node_modules`.
* Keep database credentials and JWT secrets in `.env`.
* Do not use the default Administrator password in a production deployment.
* `schema.sql` is intended for creating a fresh database. It should not be blindly re-run against an existing database containing project data.
* Customer accounts are created through the application rather than `seed_data.py`.

---

# COMP1682 Objectives

The implementation provides functionality supporting the major objectives described in the project proposal, including:

* **Objective 2:** Authentication and role-based access control
* **Objective 3:** Reservation management and conflict checking
* **Objective 5:** Reporting functionality

The implemented system also includes customer self-service booking, payment management, check-in/check-out workflows, room management and dashboard functionality.
