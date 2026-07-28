CREATE DATABASE IF NOT EXISTS smart_dental_db;
USE smart_dental_db;

CREATE TABLE IF NOT EXISTS doctors (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    specialization VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Dummy data for testing (password is 'doctor123' in plain text for this demo)
INSERT INTO doctors (name, email, password, specialization)
VALUES ('Sarah Jenkins', 'doctor@clinic.com', 'doctor123', 'Orthodontist');

CREATE TABLE IF NOT EXISTS patients (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    age INT NOT NULL,
    gender VARCHAR(20) NOT NULL,
    last_visit DATE NOT NULL,
    dental_condition VARCHAR(160) NOT NULL,
    allergies VARCHAR(255),
    systemic_conditions VARCHAR(255),
    emergency_contact VARCHAR(120),
    qr_code VARCHAR(80) UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO patients
    (name, age, gender, last_visit, dental_condition, allergies, systemic_conditions, emergency_contact, qr_code)
VALUES
    ('Emma Thompson', 34, 'Female', '2026-05-31', 'General checkup and sensitivity review', 'None reported', 'None', '+1 555 0101', 'CLINIDENT-PT-1001'),
    ('Michael Roberts', 42, 'Male', '2026-05-30', 'Root canal follow-up', 'Penicillin', 'Hypertension', '+1 555 0102', 'CLINIDENT-PT-1002'),
    ('David Chen', 29, 'Male', '2026-05-29', 'Teeth whitening consultation', 'None reported', 'None', '+1 555 0103', 'CLINIDENT-PT-1003')
ON DUPLICATE KEY UPDATE name = VALUES(name);
