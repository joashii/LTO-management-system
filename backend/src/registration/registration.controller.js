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
        // Changed 'id = ?' to 'registration_number = ?'
        const registration = await conn.query('SELECT * FROM registration WHERE registration_number = ?', [req.params.registration_number]);
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
        // Fixed target column to registration_number
        const result = await conn.query(
            'UPDATE registration SET registration_date = ?, registration_status = ?, expiration_date = ? WHERE registration_number = ?',
            [registration_date, registration_status, expiration_date, req.params.registration_number]
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
        // Fixed target column to registration_number
        const result = await conn.query('DELETE FROM registration WHERE registration_number = ?', [req.params.registration_number]);
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

// TODO : LINK THIS TO THE VIOLATION TABLE. WHEN A REGISTRATION IS MADE, IT SHOULD ALSO CHECK FOR ANY VIOLATIONS ASSOCIATED WITH THE VEHICLE AND DRIVER AND LINK THEM TO THE REGISTRATION NUMBER.

// takes in the registration number, and an array of history dates and links them to a registration number
// this is how many times a vehicle has been registered  
export const registrationHistory = async (registration_number, history_dates) => {
    let conn;
    try {
        conn = await pool.getConnection();
        const history = await conn.query(
            'SELECT * FROM violation WHERE registration_number = ? AND violation_date BETWEEN ? AND ?',
            [registration_number, history_dates[0], history_dates[1]]
        );
        return history;
    } catch (err) {
        console.error('Error fetching registration history:', err);
        throw new Error('Failed to fetch registration history');
    } finally {
        if (conn) conn.release();
    }
}