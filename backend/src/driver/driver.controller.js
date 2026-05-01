import pool from '../pool.js';

export const getDrivers = async (req, res) => {
    let conn;
    try {
        conn = await pool.getConnection();
        const drivers = await conn.query('SELECT * FROM driver');
        res.status(200).json(drivers);
    } catch (err) {
        console.error('Error fetching drivers:', err);
        res.status(500).json({ error: 'Failed to fetch drivers' });
    } finally {
        if (conn) conn.release();
    }
}

export const getDriverById = async (req, res) => {
    const { license_number } = req.params;
    console.log(license_number);
    let conn;
    try {
        conn = await pool.getConnection();
        const driver = await conn.query('SELECT * FROM driver WHERE license_number = ?', [license_number]);
        if (driver.length === 0) {
            return res.status(404).json({ error: 'Driver not found' });
        }
        res.status(200).json(driver[0]);
    } catch (err) {
        console.error('Error fetching driver:', err);
        res.status(500).json({ error: 'Failed to fetch driver' });
    } finally {
        if (conn) conn.release();
    }
}

export const createDriver = async (req, res) => {
    const { 
        license_number, 
        licence_type, 
        license_status, 
        license_expiration, 
        license_issuance, 
        full_name, 
        sex, 
        date_of_birth, 
        driver_address 
    } = req.body;

    let conn;
    try {
        conn = await pool.getConnection();
        const result = await conn.query(
            'INSERT INTO driver (license_number, licence_type, license_status, license_expiration, license_issuance, full_name, sex, date_of_birth, driver_address) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [license_number, licence_type, license_status, license_expiration, license_issuance, full_name, sex, date_of_birth, driver_address]
        );
        res.status(201).json({ success: true });
    } catch (err) {
        console.error('Error creating driver:', err);
        res.status(500).json({ success: false, error: 'Failed to create driver' });
    } finally {
        if (conn) conn.release();
    }
}

export const updateDriver = async (req, res) => {
    const { 
        license_number,
        licence_type, 
        license_status, 
        license_expiration, 
        license_issuance, 
        full_name, 
        sex, 
        date_of_birth, 
        driver_address 
    } = req.body;

    let conn;
    try {
        conn = await pool.getConnection();
        const result = await conn.query(
            'UPDATE driver SET license_number = ?, licence_type = ?, license_status = ?, license_expiration = ?, license_issuance = ?, full_name = ?, sex = ?, date_of_birth = ?, driver_address = ? WHERE license_number = ?',
            [license_number, licence_type, license_status, license_expiration, license_issuance, full_name, sex, date_of_birth, driver_address, license_number]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Driver not found' });
        }
        res.status(200).json({ success: true });
    } catch (err) {
        console.error('Error updating driver:', err);
        res.status(500).json({ success: false, error: 'Failed to update driver' });
    } finally {
        if (conn) conn.release();
    }
}

export const deleteDriver = async (req, res) => {
    const { license_number} = req.params;
    let conn;
    try {
        conn = await pool.getConnection();
        const result = await conn.query('DELETE FROM driver WHERE license_number = ?', [license_number]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Driver not found' });
        }
        res.status(200).json({ success: true });
    } catch (err) {
        console.error('Error deleting driver:', err);
        res.status(500).json({ success: false, error: 'Failed to delete driver' });
    } finally {
        if (conn) conn.release();
    }
}
