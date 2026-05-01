import pool from '../pool.js';

export const getRegistrations = async (req, res) => {
    let conn;
    try {
        conn = await pool.getConnection();
        const registrations = await conn.query('SELECT * FROM registration');
        res.status(200).json(registrations);
    } catch (err) {
        console.error('Error fetching registrations:', err);
        res.status(500).json({ error: 'Failed to fetch registrations' });
    } finally {
        if (conn) conn.release();
    }
}

export const getRegistrationById = async (req, res) => {
    let conn;
    try {
        conn = await pool.getConnection();
        const registration = await conn.query('SELECT * FROM registration WHERE id = ?', [req.params.id]);
        if (registration.length === 0) {
            return res.status(404).json({ error: 'Registration not found' });
        }
        res.status(200).json(registration[0]);  
    } catch (err) {
        console.error('Error fetching registration:', err);
        res.status(500).json({ error: 'Failed to fetch registration' });
    } finally {
        if (conn) conn.release();
    }
}

// When a registration is made, there should be a vehicle and driver associated with it. This means that the registration creation process should also involve creating entries in the vehicle and driver tables
export const createRegistration = async (req, res) => {
    const { registration_number, registration_date, registration_status, expiration_date } = req.body;
    let conn;
    try {
        conn = await pool.getConnection();
        const result = await conn.query(
            'INSERT INTO registration (registration_number, registration_date, registration_status, expiration_date) VALUES (?, ?, ?, ?)',
            [registration_number, registration_date, registration_status, expiration_date]
        );
        res.status(201).json({ id: result.insertId });
    }
    catch (err) {
        console.error('Error creating registration:', err);
        res.status(500).json({ error: 'Failed to create registration' });
    } finally {
        if (conn) conn.release();
    }
}

export const updateRegistration = async (req, res) => {
    const { 
        registration_number, 
        registration_date, 
        registration_status, 
        expiration_date 
    } = req.body;

    let conn;
    try {
        conn = await pool.getConnection();
        // Update registration details. In a real application, you would also want to handle updates to the associated driver and vehicle records, but for simplicity, we're just updating the registration here.
        // Updating everything else referencing this registration
        const result = await conn.query(
            'UPDATE registration SET registration_number = ?, registration_date = ?, registration_status = ?, expiration_date = ? WHERE id = ?',
            [registration_number, registration_date, registration_status, expiration_date, req.params.id]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Registration not found' });
        }
        res.status(200).json({ success: true });
    } catch (err) {
        console.error('Error updating registration:', err);
        res.status(500).json({ error: 'Failed to update registration' });
    } finally {
        if (conn) conn.release();
    }
}

export const deleteRegistration = async (req, res) => { 
    let conn;
    try {
        conn = await pool.getConnection();
        // Deleting the registration should also delete the associated driver and vehicle records, but for simplicity, we're just deleting the registration here.
        const result = await conn.query('DELETE FROM registration WHERE id = ?', [req.params.id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Registration not found' });
        }
        res.status(200).json({ success: true });
    } catch (err) {
        console.error('Error deleting registration:', err);
        res.status(500).json({ error: 'Failed to delete registration' });
    } finally {
        if (conn) conn.release();
    }
}