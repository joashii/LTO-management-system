# LTO Management System

A full-stack web application built using React, Express, and MariaDB.
This project demonstrates basic CRUD (Create, Read, Update, Delete) operations with a clean frontend and a connected backend API.

---

## 🛠️ Tech Stack

**Frontend**

* React (Vite)

**Backend**

* Node.js
* Express

**Database**

* MariaDB

---

## 📁 Project Structure

```
LTO-management-system/
│
├── frontend/        # React app
├── backend/         # Express server
├── data.sql         # Database setup file
```

---

## ⚙️ Setup Instructions

### 1. Clone the repository

```
git clone <repo-url>
cd LTO-management-system
```

---

### 2. Setup the Database

Make sure MariaDB is installed and running.

Run:

```
mysql -u root -p < data.sql
```

This will create:

* database: `testdb`
* table: `users`

---

### 3. Configure Environment Variables

Go to the `backend` folder and create a `.env` file:

```
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password_here
DB_NAME=testdb
```

---

### 4. Install Dependencies

#### Backend

```
cd backend
npm install
```

#### Frontend

```
cd ../frontend
npm install
```

---

### 5. Run the Application

#### Start backend

```
cd backend
node server.js
```

#### Start frontend

```
cd frontend
npm run dev
```

---

## 🔒 Notes

* The `.env` file is not included for security reasons.
* Use `.env.example` as a reference.
