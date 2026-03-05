-- National Vehicle Registry Database Schema
CREATE DATABASE IF NOT EXISTS nvr_db;
USE nvr_db;

-- Users Table
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('super_admin', 'admin_officer', 'registration_staff') NOT NULL DEFAULT 'registration_staff',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Vehicles Table
CREATE TABLE IF NOT EXISTS vehicles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  owner_name VARCHAR(150) NOT NULL,
  national_id VARCHAR(50) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  address TEXT NOT NULL,
  make VARCHAR(100) NOT NULL,
  model VARCHAR(100) NOT NULL,
  year INT NOT NULL,
  color VARCHAR(50) NOT NULL,
  engine_number VARCHAR(100) NOT NULL UNIQUE,
  chassis_number VARCHAR(100) NOT NULL UNIQUE,
  plate_number VARCHAR(20) UNIQUE,
  status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
  submitted_by INT,
  reviewed_by INT,
  rejection_reason TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (submitted_by) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Plate Numbers Table (for uniqueness tracking)
CREATE TABLE IF NOT EXISTS plate_numbers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  plate_number VARCHAR(20) NOT NULL UNIQUE,
  vehicle_id INT,
  generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE SET NULL
);

-- Audit Log Table
CREATE TABLE IF NOT EXISTS audit_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50),
  entity_id INT,
  details TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Sample Data
INSERT INTO users (name, email, password, role) VALUES
('Super Admin', 'superadmin@nvr.gov', '$2a$10$2NOk/zN/DwojIgInQExInua4Cr5mInoy2EyxWZMBwQg8LiaYdcJii', 'super_admin'),
('Admin Officer', 'admin@nvr.gov', '$2a$10$2NOk/zN/DwojIgInQExInua4Cr5mInoy2EyxWZMBwQg8LiaYdcJii', 'admin_officer'),
('John Staff', 'staff@nvr.gov', '$2a$10$2NOk/zN/DwojIgInQExInua4Cr5mInoy2EyxWZMBwQg8LiaYdcJii', 'registration_staff');
-- Password for all sample users: Admin@1234

INSERT INTO vehicles (owner_name, national_id, phone, address, make, model, year, color, engine_number, chassis_number, plate_number, status, submitted_by, reviewed_by) VALUES
('Alice Johnson', 'NID-001234', '0712345678', '123 Main St, Nairobi', 'Toyota', 'Camry', 2020, 'White', 'ENG-TYC-001', 'CHS-TYC-001', 'NVR-AB-1001', 'approved', 3, 2),
('Bob Smith', 'NID-005678', '0723456789', '456 Park Ave, Mombasa', 'Honda', 'Civic', 2019, 'Blue', 'ENG-HDC-002', 'CHS-HDC-002', 'NVR-CD-2045', 'approved', 3, 2),
('Carol White', 'NID-009012', '0734567890', '789 Green Rd, Kisumu', 'Nissan', 'X-Trail', 2021, 'Silver', 'ENG-NSX-003', 'CHS-NSX-003', NULL, 'pending', 3, NULL);

INSERT INTO plate_numbers (plate_number, vehicle_id) VALUES
('NVR-AB-1001', 1),
('NVR-CD-2045', 2);
