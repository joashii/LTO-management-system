CREATE DATABASE ltodatabase;

USE ltodatabase;

CREATE TABLE driver (
    licence_number VARCHAR(20) PRIMARY KEY,
    license_type VARCHAR(20),
    license_expiration DATE,
    license_issuance DATE,
    full_name VARCHAR(100),
    sex VARCHAR(10),
    date_of_birth DATE,
    address VARCHAR(100)
);

CREATE TABLE vehicle (
    plate_number VARCHAR(20) PRIMARY KEY,
    engine_number VARCHAR(50) PRIMARY KEY,
    chassis_number VARCHAR(50) PRIMARY KEY,
    make VARCHAR(50),
    color VARCHAR(20),
    vehicle_type VARCHAR(20),
    model VARCHAR(50),
    year_of_manufacture INT,
    license_fk FOREIGN KEY(license_number) REFERENCES driver(license_number),
    registration_fk FOREIGN KEY(registration_number) REFERENCES registration(registration_number),
);


# DRIVER AND VEHICLE 

CREATE TABLE driver_owns (
    foreign key(licence_number) references driver(licence_number),
    foreign key(plate_number) references vehicle(plate_number),
    foreign key(engine_number) references vehicle(engine_number),
    foreign key(chassis_number) references vehicle(chassis_number)
);  

CREATE TABLE vehicle_has (
    foreign key(plate_number) references vehicle(plate_number),
    foreign key(engine_number) references vehicle(engine_number),
    foreign key(chassis_number) references vehicle(chassis_number),
);


# REGISTRATION TABLES
CREATE TABLE registration (
    registration_number VARCHAR(20) PRIMARY KEY,
    registration_date DATE,
    registration_status VARCHAR(20),
    expiration_date DATE,   
);

CREATE TABLE registration_history (
    FOREIGN KEY(registration_number) REFERENCES registration(registration_number),
    registration_history VARCHAR(20),
);

CREATE TABLE registration_commits (
    foreign key(registration_number) references registration(registration_number),
    foreign key(date_and_location) references violation(date_and_location)
);

# VIOLATION TABLES
CREATE TABLE violation (
    violation_id INT AUTO_INCREMENT PRIMARY KEY,
    date_and_location VARCHAR(100),
    violation_status VARCHAR(20),
    fine_amount DECIMAL(10, 2),
    apprehending_officer VARCHAR(100),
    foreign key(licence_number) references driver(licence_number),
    foreign key(registration_number) references registration(registration_number)
);
CREATE TABLE violation_type (
    violation_type INT,
    foreign key(violation_id) references violation(violation_id)
);

