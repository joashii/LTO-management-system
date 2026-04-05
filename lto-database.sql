CREATE DATABASE ltodatabase;

USE ltodatabase;

CREATE TABLE driver (
    license_number VARCHAR(20) PRIMARY KEY,
    license_type VARCHAR(20),
    lincense_status VARCHAR(20),
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
    date_and_location VARCHAR(100),
    plate_number VARCHAR(20),
    engine_number VARCHAR(50),
    chassis_number VARCHAR(50),
    PRIMARY KEY (date_and_location, plate_number, engine_number, chassis_number),
    FOREIGN KEY (plate_number, engine_number, chassis_number) REFERENCES vehicle(plate_number, engine_number, chassis_number)
);

CREATE TABLE violation (
    violation_id INT AUTO_INCREMENT PRIMARY KEY,
    date_and_location VARCHAR(100),
    violation_status VARCHAR(20),
    fine_amount DECIMAL(10, 2),
    apprehending_officer VARCHAR(100),
    license_number VARCHAR(20),
    registration_number VARCHAR(20),
    foreign key(license_number) references driver(license_number),
    foreign key(registration_number) references registration(registration_number)
);

CREATE TABLE violation_type (
    violation_id INT,
    violation_type VARCHAR(50),
    PRIMARY KEY(violation_id, violation_type),
    foreign key(violation_id) references violation(violation_id)
);

CREATE TABLE registration_history (
    registration_number VARCHAR(20) PRIMARY KEY,
    registration_history VARCHAR(20),
    FOREIGN KEY(registration_number) REFERENCES registration(registration_number)
);

CREATE TABLE registration_commits (
    registration_number VARCHAR(20),   -- add this
    violation_id INT,                  -- add this
    PRIMARY KEY (registration_number, violation_id),  -- add this
    FOREIGN KEY (registration_number) REFERENCES registration(registration_number),
    FOREIGN KEY (violation_id) REFERENCES violation(violation_id)
);