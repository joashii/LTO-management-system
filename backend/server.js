require('dotenv').config();

const express = require('express');
const cors = require('cors');
const pool = require('./db');

const app = express();

app.use(cors());
app.use(express.json());

// basic check
app.get('/', (req, res) => {
  res.send('Server is running');
});

// get all users
app.get('/users', async (req, res) => {
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
});

// add user
app.post('/users', async (req, res) => {
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
});

// delete user
app.delete('/users/:id', async (req, res) => {
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
});

// update user
app.put('/users/:id', async (req, res) => {
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
});

app.listen(5000, () => {
  console.log('Server running on http://localhost:5000');
});