import pool from '../pool.js';

export const getViolation = async (req, res) => {
    let conn;
    try {
        conn = await pool.getConnection();
        const violations = await conn.query('SELECT * FROM violation');
        res.status(200).json(violations);
    } catch (err) {
        console.error('Error fetching violations:', err);
        res.status(500).json({ error: 'Failed to fetch violations' });
    } finally {
        if (conn) conn.release();
    }
}

export const getViolationById = async (req, res) => {
    let conn;
    try {
        conn = await pool.getConnection();
        const violation = await conn.query('SELECT * FROM violation WHERE violation_id = ?', [req.params.id]);
        if (violation.length === 0) {
            return res.status(404).json({ error: 'Violation not found' });
        }
        res.status(200).json(violation[0]);
    } catch (err) {
        console.error('Error fetching violation:', err);
        res.status(500).json({ error: 'Failed to fetch violation' });
    } finally {
        if (conn) conn.release();
    }
}

export const createViolation = async (req, res) => {
    const {
        violation_date, 
        violation_location, 
        violation_status, 
        fine_amount,
        apprehending_officer,
        license_number,
        registration_number
    } = req.body;
    let conn;

    try {
        conn = await pool.getConnection();
        const result = await conn.query(
            'INSERT INTO violation (violation_date, violation_location, violation_status, fine_amount, apprehending_officer, license_number, registration_number) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [violation_date, violation_location, violation_status, fine_amount, apprehending_officer, license_number, registration_number]
        );
        res.status(201).json({ id: result.insertId });
    } catch (err) {
        console.error('Error creating violation:', err);
        res.status(500).json({ error: 'Failed to create violation' });
    } finally {
        if (conn) conn.release();
    }
}

export const updateViolation = async (req, res) => {
    const { 
        violation_date, 
        violation_location, 
        violation_status, 
        fine_amount,
        apprehending_officer,
        license_number,
        registration_number
    } = req.body;
    let conn;

    try {
        conn = await pool.getConnection();
        await conn.query(
            'UPDATE violation SET violation_date = ?, violation_location = ?, violation_status = ?, fine_amount = ?, apprehending_officer = ?, license_number = ?, registration_number = ? WHERE violation_id = ?',
            [violation_date, violation_location, violation_status, fine_amount, apprehending_officer, license_number, registration_number, req.params.id]
        );
        res.status(200).json({ message: 'Violation updated' });
    } catch (err) {
        console.error('Error updating violation:', err);
        res.status(500).json({ error: 'Failed to update violation' });
    } finally {
        if (conn) conn.release();
    }
}

export const deleteViolation = async (req, res) => {
    let conn;
    try {
        conn = await pool.getConnection();
        await conn.query('DELETE FROM violation WHERE violation_id = ?', [req.params.id]);
        res.status(200).json({ message: 'Violation deleted' });
    } catch (err) {
        console.error('Error deleting violation:', err);
        res.status(500).json({ error: 'Failed to delete violation' });
    } finally {
        if (conn) conn.release();
    }
}  