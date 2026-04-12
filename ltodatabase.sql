DROP DATABASE IF EXISTS ltodatabase;   -- inadd ko lang for checking 
CREATE DATABASE ltodatabase;
USE ltodatabase;

CREATE TABLE driver (
    license_number VARCHAR(20) PRIMARY KEY,
    license_type VARCHAR(20),
    license_status VARCHAR(20),     -- inedit ko lang typo ksi, lincense_status
    license_expiration DATE,
    license_issuance DATE,
    full_name VARCHAR(100),
    sex VARCHAR(10),
    date_of_birth DATE,
    address VARCHAR(100)
);

CREATE TABLE registration (
    registration_number VARCHAR(20) PRIMARY KEY,
    registration_date DATE,
    registration_status VARCHAR(20),
    expiration_date DATE
);

CREATE TABLE vehicle (
    plate_number VARCHAR(20),
    engine_number VARCHAR(50),
    chassis_number VARCHAR(50),
    make VARCHAR(50),
    color VARCHAR(20),
    vehicle_type VARCHAR(20),
    model VARCHAR(50),
    year_of_manufacture INT,
    license_number VARCHAR(20),
    registration_number VARCHAR(20),
    PRIMARY KEY (plate_number, engine_number, chassis_number),
    FOREIGN KEY (license_number) REFERENCES driver(license_number),
    FOREIGN KEY (registration_number) REFERENCES registration(registration_number)
);

CREATE TABLE driver_owns (
    license_number VARCHAR(20),
    plate_number VARCHAR(20),
    engine_number VARCHAR(50),
    chassis_number VARCHAR(50),
    PRIMARY KEY (license_number, plate_number, engine_number, chassis_number),
    FOREIGN KEY(license_number) REFERENCES driver(license_number),
    FOREIGN KEY(plate_number, engine_number, chassis_number) REFERENCES vehicle(plate_number, engine_number,  chassis_number)
);  

CREATE TABLE vehicle_has (
    registration_number VARCHAR(20),
    plate_number VARCHAR(20),
    engine_number VARCHAR(50),
    chassis_number VARCHAR(50),
    PRIMARY KEY (registration_number, plate_number, engine_number, chassis_number),
    FOREIGN KEY (registration_number) REFERENCES registration(registration_number),
    FOREIGN KEY (plate_number, engine_number, chassis_number) REFERENCES vehicle(plate_number, engine_number, chassis_number)
);

CREATE TABLE involved_in (
    violation_date DATE,        -- separated date_and_location VARCHAR(100)
    location VARCHAR(100),
    plate_number VARCHAR(20),
    engine_number VARCHAR(50),
    chassis_number VARCHAR(50),
    PRIMARY KEY (violation_date, location, plate_number, engine_number, chassis_number),
    FOREIGN KEY (plate_number, engine_number, chassis_number) REFERENCES vehicle(plate_number, engine_number, chassis_number)
);

CREATE TABLE violation (
    violation_id INT AUTO_INCREMENT PRIMARY KEY,
    violation_date DATE,        -- separated date_and_location VARCHAR(100)
    location VARCHAR(100),
    violation_status VARCHAR(20),
    fine_amount DECIMAL(10, 2),
    apprehending_officer VARCHAR(100),
    license_number VARCHAR(20),
    registration_number VARCHAR(20),
    FOREIGN KEY (license_number) REFERENCES driver(license_number),
    FOREIGN KEY (registration_number) REFERENCES registration(registration_number)
);

CREATE TABLE violation_type (
    violation_id INT,
    violation_type VARCHAR(50),
    PRIMARY KEY(violation_id, violation_type),
    foreign key(violation_id) references violation(violation_id)
);

CREATE TABLE registration_history (
    registration_number VARCHAR(20),
    history_date DATE,                 
    PRIMARY KEY (registration_number, history_date),
    FOREIGN KEY (registration_number) REFERENCES registration(registration_number)
);

CREATE TABLE registration_commits (
    registration_number VARCHAR(20),   -- add this
    violation_id INT,                  -- add this
    PRIMARY KEY (registration_number, violation_id),  -- add this
    FOREIGN KEY (registration_number) REFERENCES registration(registration_number),
    FOREIGN KEY (violation_id) REFERENCES violation(violation_id)
);


-- SEED DATA -- 

INSERT INTO driver VALUES
('N01-23-456789', 'Non-Professional', 'Active',   '2027-05-10', '2022-05-10', 'Juan Dela Cruz',  'Male',   '1995-03-14', '123 Rizal St., Manila'),
('P01-21-123456', 'Professional',     'Active',   '2026-08-20', '2021-08-20', 'Maria Santos',    'Female', '1988-07-22', '45 Quezon Ave., QC'),
('N02-20-654321', 'Non-Professional', 'Expired',  '2025-03-01', '2020-03-01', 'Carlos Reyes',    'Male',   '1992-11-05', '88 Bonifacio Blvd., Pasig'),
('P02-22-111222', 'Professional',     'Active',   '2028-01-15', '2023-01-15', 'Ana Villanueva',  'Female', '1990-06-30', '22 Mabini St., Cebu'),
('N03-19-333444', 'Non-Professional', 'Suspended','2024-09-10', '2019-09-10', 'Rico Fernandez',  'Male',   '1985-12-01', '5 Aguinaldo Rd., Cavite');

INSERT INTO registration VALUES
('REG-2024-001', '2024-01-15', 'Active',  '2025-01-15'),
('REG-2023-089', '2023-06-01', 'Expired', '2024-06-01'),
('REG-2024-055', '2024-04-10', 'Active',  '2025-04-10'),
('REG-2022-010', '2022-03-20', 'Expired', '2023-03-20'),
('REG-2024-099', '2024-07-01', 'Active',  '2025-07-01');

INSERT INTO vehicle VALUES
('ABC 1234', 'ENG-00123', 'CHS-00456', 'Toyota',     'White',  'Sedan',  'Vios',   2020, 'N01-23-456789', 'REG-2024-001'),
('XYZ 5678', 'ENG-00789', 'CHS-00012', 'Honda',      'Silver', 'SUV',    'CR-V',   2019, 'P01-21-123456', 'REG-2023-089'),
('LMN 9012', 'ENG-00345', 'CHS-00678', 'Mitsubishi', 'Black',  'Pickup', 'Strada', 2021, 'N02-20-654321', 'REG-2024-055'),
('DEF 3456', 'ENG-00567', 'CHS-00890', 'Ford',       'Blue',   'SUV',    'Everest',2022, 'P02-22-111222', 'REG-2022-010'),
('GHI 7890', 'ENG-00901', 'CHS-00234', 'Suzuki',     'Red',    'Sedan',  'Ciaz',   2023, 'N03-19-333444', 'REG-2024-099');

INSERT INTO driver_owns VALUES
('N01-23-456789', 'ABC 1234', 'ENG-00123', 'CHS-00456'),
('P01-21-123456', 'XYZ 5678', 'ENG-00789', 'CHS-00012'),
('N02-20-654321', 'LMN 9012', 'ENG-00345', 'CHS-00678'),
('P02-22-111222', 'DEF 3456', 'ENG-00567', 'CHS-00890'),
('N03-19-333444', 'GHI 7890', 'ENG-00901', 'CHS-00234');

INSERT INTO vehicle_has VALUES
('REG-2024-001', 'ABC 1234', 'ENG-00123', 'CHS-00456'),
('REG-2023-089', 'XYZ 5678', 'ENG-00789', 'CHS-00012'),
('REG-2024-055', 'LMN 9012', 'ENG-00345', 'CHS-00678'),
('REG-2022-010', 'DEF 3456', 'ENG-00567', 'CHS-00890'),
('REG-2024-099', 'GHI 7890', 'ENG-00901', 'CHS-00234');

INSERT INTO violation VALUES
(1, '2024-03-10', 'EDSA, Makati',      'Unpaid', 2000.00, 'PO1 Reyes',  'N01-23-456789', 'REG-2024-001'),
(2, '2024-01-22', 'C5 Road, Pasig',    'Paid',   1500.00, 'PO2 Garcia', 'P01-21-123456', 'REG-2023-089'),
(3, '2024-05-05', 'EDSA, Quezon City', 'Unpaid', 3000.00, 'PO3 Cruz',   'N02-20-654321', 'REG-2024-055'),
(4, '2024-06-18', 'SLEX, Muntinlupa',  'Paid',   1000.00, 'PO1 Santos', 'P02-22-111222', 'REG-2022-010'),
(5, '2024-08-30', 'Ortigas, Pasig',    'Unpaid', 2500.00, 'PO2 Lim',    'N03-19-333444', 'REG-2024-099');

INSERT INTO involved_in VALUES
('2024-03-10', 'EDSA, Makati',      'ABC 1234', 'ENG-00123', 'CHS-00456'),
('2024-01-22', 'C5 Road, Pasig',    'XYZ 5678', 'ENG-00789', 'CHS-00012'),
('2024-05-05', 'EDSA, Quezon City', 'LMN 9012', 'ENG-00345', 'CHS-00678'),
('2024-06-18', 'SLEX, Muntinlupa',  'DEF 3456', 'ENG-00567', 'CHS-00890'),
('2024-08-30', 'Ortigas, Pasig',    'GHI 7890', 'ENG-00901', 'CHS-00234');

INSERT INTO violation_type VALUES
(1, 'Reckless Driving'),
(2, 'Illegal Parking'),
(3, 'Overspeeding'),
(4, 'Illegal Overtaking'),
(5, 'Drunk Driving');

INSERT INTO registration_history VALUES
('REG-2024-001', '2024-01-15'),
('REG-2024-001', '2025-01-15'),  -- added for testing history
('REG-2024-055', '2024-04-10'),
('REG-2022-010', '2022-03-20'),
('REG-2024-099', '2024-07-01');

INSERT INTO registration_commits VALUES
('REG-2024-001', 1),
('REG-2023-089', 2),
('REG-2024-055', 3),
('REG-2022-010', 4),
('REG-2024-099', 5);


-- REPORTS TO BE GENERATED --

-- 1. 
SELECT * FROM driver
WHERE license_type = 'Non-Professional'
    AND license_status = 'Active'
    AND sex = 'Male'
    AND (YEAR(CURDATE()) - YEAR(date_of_birth)) BETWEEN 18 AND 60;


-- 2.
SELECT v.plate_number,v.make,v.model,v.color,v.year_of_manufacture
FROM vehicle v
JOIN driver_owns d 
ON v.plate_number = d.plate_number
AND v.engine_number = d.engine_number
AND v.chassis_number = d.chassis_number
WHERE d.license_number = 'N01-23-456789';       -- sample driver

-- 3. 
SELECT v.plate_number, v.make, v.model, v.color, r.expiration_date
FROM vehicle v 
JOIN registration r 
ON v.registration_number = r.registration_number
WHERE r.expiration_date < '2025-01-01';

-- 4.
SELECT license_number, full_name, license_status, license_expiration
FROM driver
WHERE license_status = 'Suspended'
OR license_expiration < CURRENT_DATE;

-- 5.
SELECT v.violation_id, vt.violation_type, v.violation_date, v.location, v.violation_status, v.fine_amount
FROM violation v 
JOIN violation_type vt 
ON v.violation_id = vt.violation_id
WHERE v.license_number = 'N01-23-456789'
AND v.violation_date BETWEEN '2024-01-01' AND '2024-12-31';

-- 6.
SELECT vt.violation_type, COUNT(*) AS total_violations
FROM violation v
JOIN violation_type vt ON v.violation_id = vt.violation_id
WHERE YEAR(v.violation_date) = 2024     -- Using 2024 since yung sample data is from 2024
GROUP BY vt.violation_type;

-- 7.
SELECT v.plate_number, v.make, v.model, v.color, i.location, i.violation_date
FROM involved_in i 
JOIN vehicle v 
ON i.plate_number = v.plate_number
AND i.engine_number = v.engine_number
AND i.chassis_number = v.chassis_number
WHERE i.location LIKE '%Pasig%';