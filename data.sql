CREATE DATABASE testdb;

USE testdb;

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100),
  age INT
);

INSERT INTO users (name, age)
VALUES ('John Doe', 20), ('Doe-John', 22);