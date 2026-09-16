-- SunBeam Lodge Hotel Management System
-- MySQL Database Schema
-- COMP1682 - Nathan Chellah

CREATE DATABASE IF NOT EXISTS sunbeam_hms;
USE sunbeam_hms;

-- ROLES for RBAC
CREATE TABLE roles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE  -- 'Administrator', 'Receptionist'
);

INSERT INTO roles (name) VALUES ('Administrator'), ('Receptionist');

-- STAFF (Admin portal login users)
CREATE TABLE staff (
    id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role_id INT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (role_id) REFERENCES roles(id)
);

-- GUESTS
CREATE TABLE guests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100),
    phone VARCHAR(30) NOT NULL,
    id_number VARCHAR(50),          -- NRC number ... might not fully implement
    nationality VARCHAR(50),
    address VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- CUSTOMERS
CREATE TABLE customers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    guest_id INT NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (guest_id) REFERENCES guests(id)
);

-- ROOM TYPES
CREATE TABLE room_types (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,      -- 'Single', 'Double', 'Suite', 'Conference'
    base_price DECIMAL(10,2) NOT NULL,
    capacity INT DEFAULT 1,
    description VARCHAR(255)
);

-- ROOMS
CREATE TABLE rooms (
    id INT AUTO_INCREMENT PRIMARY KEY,
    room_number VARCHAR(10) NOT NULL UNIQUE,
    room_type_id INT NOT NULL,
    status ENUM('available','occupied','maintenance') DEFAULT 'available',
    floor VARCHAR(10),
    FOREIGN KEY (room_type_id) REFERENCES room_types(id)
);

-- RESERVATIONS
CREATE TABLE reservations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    guest_id INT NOT NULL,
    room_id INT NOT NULL,
    check_in_date DATE NOT NULL,
    check_out_date DATE NOT NULL,
    actual_check_in DATETIME NULL,
    actual_check_out DATETIME NULL,
    status ENUM('booked','checked_in','checked_out','cancelled') DEFAULT 'booked',
    total_amount DECIMAL(10,2),
    created_by INT NOT NULL,        -- staff id
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (guest_id) REFERENCES guests(id),
    FOREIGN KEY (room_id) REFERENCES rooms(id),
    FOREIGN KEY (created_by) REFERENCES staff(id),

   -- Ensure reservation dates are valid
    CONSTRAINT chk_dates CHECK (check_out_date > check_in_date)
);

-- PAYMENTS
CREATE TABLE payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    reservation_id INT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    method ENUM('cash','card','mobile_money') NOT NULL,
    status ENUM('pending','paid','refunded') DEFAULT 'pending',
    paid_at TIMESTAMP NULL,
    FOREIGN KEY (reservation_id) REFERENCES reservations(id)
);

-- Helpful index for fast availability search
CREATE INDEX idx_reservation_dates ON reservations (room_id, check_in_date, check_out_date);
