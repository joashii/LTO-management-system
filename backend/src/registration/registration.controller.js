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

export const createRegistration = async (req, res) => {
    const { registration_number, registration_date, registration_status, expiration_date, selected_vehicle } = req.body;
    
    // Basic payload validation check
    if (!selected_vehicle) {
        return res.status(400).json({ error: 'You must select an existing vehicle asset to assign this registration.' });
    }

    let conn;
    try {
        // Parse the stringified compound target keys from the dropdown selection block
        const targetVehicle = JSON.parse(selected_vehicle);
        const { plate, engine, chassis } = targetVehicle;

        conn = await pool.getConnection();

        const activeCheck = await conn.query(`
            SELECT r.registration_number 
            FROM vehicle_has vh
            JOIN registration r ON vh.registration_number = r.registration_number
            WHERE vh.plate_number = ? 
              AND vh.engine_number = ? 
              AND vh.chassis_number = ?
              AND r.registration_status = 'Active'
        `, [plate, engine, chassis]);

        // If the query returns a row, it means the vehicle is legally registered right now
        if (activeCheck.length > 0) {
            return res.status(400).json({ 
                error: `LTO Restriction: Vehicle (${plate}) already possesses an 'Active' registration (Code: ${activeCheck[0].registration_number}). You cannot register it again until its current status is changed to Expired.` 
            });
        }

        await conn.beginTransaction();

        // Insert standard Registration structural profile
        await conn.query(
            'INSERT INTO registration (registration_number, registration_date, registration_status, expiration_date) VALUES (?, ?, ?, ?)',
            [registration_number, registration_date, registration_status, expiration_date]
        );

        // Populate intersection relationship bridge tracker (vehicle_has)
        await conn.query(
            'INSERT INTO vehicle_has (registration_number, plate_number, engine_number, chassis_number) VALUES (?, ?, ?, ?)',
            [registration_number, plate, engine, chassis]
        );

        // Track transaction baseline logging footprint inside required registration_history
        await conn.query(
            'INSERT INTO registration_history (registration_number, history_date) VALUES (?, ?)',
            [registration_number, registration_date]
        );

        await conn.commit();
        res.status(201).json({ success: true });

    } catch (err) {
        if (conn) await conn.rollback();
        console.error('Error creating registration transaction:', err);
        
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ error: 'This Registration Number already exists in the system.' });
        }
        res.status(500).json({ success: false, error: 'Failed to process transactional registration pipeline.' });
    } finally {
        if (conn) conn.release();
    }
};

export const updateRegistration = async (req, res) => {
    const { registration_date, registration_status, expiration_date } = req.body;
    let conn;
    try {
        conn = await pool.getConnection();
        await conn.beginTransaction();

        // Update core profile data
        const result = await conn.query(
            'UPDATE registration SET registration_date = ?, registration_status = ?, expiration_date = ? WHERE registration_number = ?',
            [registration_date, registration_status, expiration_date, req.params.registration_number]
        );
        if (result.affectedRows === 0) {
            await conn.rollback();
            return res.status(404).json({ error: 'Registration profile not found' });
        }

        // Add an entry to the history table to document this renewal occurrence
        await conn.query(
            'INSERT INTO registration_history (registration_number, history_date) VALUES (?, ?)',
            [req.params.registration_number, registration_date]
        );

        await conn.commit();
        res.status(200).json({ success: true });
    } catch (err) {
        if (conn) await conn.rollback();
        console.error('Error updating registration:', err);
        res.status(500).json({ error: 'Failed to update registration record.' });
    } finally {
        if (conn) conn.release();
    }
}

export const deleteRegistration = async (req, res) => {
    const { registration_number } = req.params;
    let conn;
    try {
        conn = await pool.getConnection();

        //check, is this registration linked to any vehicles in the mapping table?
        const rows = await conn.query(
            "SELECT COUNT(*) as count FROM vehicle_has WHERE registration_number = ?", 
            [registration_number]
        );
        const linkCount = Array.isArray(rows) ? rows[0].count : rows.count;

        if (linkCount > 0) {
            return res.status(400).json({ 
                error: `Cannot delete registration. It is currently actively linked to ${linkCount} vehicle(s).` 
            });
        }

        // Proceed to delete
        const result = await conn.query('DELETE FROM registration WHERE registration_number = ?', [registration_number]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Registration record not found' });
        }
        res.status(200).json({ message: 'Registration asset removed successfully' });

    } catch (err) {
        console.error('SQL Error deleting registration:', err);
        res.status(500).json({ error: 'Failed to delete registration due to database constraints.' });
    } finally {
        if (conn) conn.release();
    }
};

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