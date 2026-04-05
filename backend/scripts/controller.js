// controller.js
/*
    This file is intended to have all the functions regarding the backend,
    since there arent a lot, we can cram them all into one file.
    
    !! Refactoring is required if file exceeds 500 lines. !!
*/

import pool from './db.js';

// get all users
async function getUsers(req, res) {
    let conn;
    try {
        conn = await pool.getConnection();
        const users = await conn.query('SELECT * FROM users');
        res.json(users);
    } catch (err) {
        console.error('Error fetching users:', err);
        res.status(500).json({ error: 'Failed to fetch users' });
    } finally {
        if (conn) conn.release();
    }
}

// add user
async function addUser(req, res) {
  const { name, age } = req.body;

  if (!name || !age) {
    return res.status(400).json({ error: 'Name and age are required' });
  }

  let conn;
  try {
    conn = await pool.getConnection();
    const result = await conn.query(
      'INSERT INTO users (name, age) VALUES (?, ?)',
      [name, age]
    );
    res.json({ id: result.insertId, name, age });
  } catch (err) {
    console.error('Error adding user:', err);
    res.status(500).json({ error: 'Failed to add user' });
  } finally {
    if (conn) conn.release();
  }
};

// delete user
async function deleteUser(req, res) {
  const { id } = req.params;

  let conn;
  try {
    conn = await pool.getConnection();
    await conn.query('DELETE FROM users WHERE id = ?', [id]);
    res.json({ message: 'User deleted' });
  } catch (err) {
    console.error('Error deleting user:', err);
    res.status(500).json({ error: 'Failed to delete user' });
  } finally {
    if (conn) conn.release();
  }
};

// update user
async function updateUser(req, res) {
  const { id } = req.params;
  const { name, age } = req.body;

  let conn;
  try {
    conn = await pool.getConnection();
    await conn.query(
      'UPDATE users SET name = ?, age = ? WHERE id = ?',
      [name, age, id]
    );
    res.json({ message: 'User updated' });
  } catch (err) {
    console.error('Error updating user:', err);
    res.status(500).json({ error: 'Failed to update user' });
  } finally {
    if (conn) conn.release();
  }
};

// Temp functions for fetching data from the other tables, to be implemented later when the frontend is ready to use them.
async function getDrivers(req, res) {
    let conn;
    try{
        conn = await pool.getConnection();
        const drivers = await conn.query('SELECT * FROM driver');
        res.json(drivers);
    } catch (err) {
        console.error('Error fetching drivers:', err);
        res.status(500).json({ error: 'Failed to fetch drivers' });
    } finally {
        if (conn) conn.release();
    }
};

async function getVehicles(req, res) {
    return;
}

async function getRegistrations(req, res) {
    return;
};

async function getViolations(req, res) {
    return;
};

export default {
    getUsers,
    addUser,
    deleteUser,
    updateUser,
    getDrivers,
    getVehicles,
    getRegistrations,
    getViolations
};