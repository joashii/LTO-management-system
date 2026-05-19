import pool from '../pool.js';

export const getVehicles = async (req, res) => {
    let conn;
    try {
        conn = await pool.getConnection();
        const vehicles = await conn.query(`
            SELECT v.*, vh.registration_number, r.registration_status, r.expiration_date
            FROM vehicle v
            LEFT JOIN vehicle_has vh ON v.plate_number = vh.plate_number 
                AND v.engine_number = vh.engine_number AND v.chassis_number = vh.chassis_number
            LEFT JOIN registration r ON vh.registration_number = r.registration_number
        `);
        res.status(200).json(vehicles);
    } catch (err) {
        console.error('Error fetching vehicles:', err);
        res.status(500).json({ error: 'Failed to fetch vehicles' });
    } finally {
        if (conn) conn.release();
    }
};


export const getVehicleById = async (req, res) => {
    let conn;
    try {
        conn = await pool.getConnection();
        const vehicle = await conn.query(
            'SELECT * FROM vehicle WHERE plate_number = ? AND engine_number = ? AND chassis_number = ?', 
            [req.params.plate_number, req.params.engine_number, req.params.chassis_number]
        );
        if (vehicle.length === 0) return res.status(404).json({ error: 'Vehicle not found' });
        res.status(200).json(vehicle[0]);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch vehicle' });
    } finally {
        if (conn) conn.release();
    }
};


export const createVehicle = async (req, res) => {
    const {
        plate_number, engine_number, chassis_number,
        make, model, vehicle_type, year_of_manufacture, color,
        license_number
    } = req.body; 

    let conn;
    try {
        conn = await pool.getConnection();
        await conn.beginTransaction();

        // Structural write to master entity table
        await conn.query(
            `INSERT INTO vehicle 
            (plate_number, engine_number, chassis_number, vehicle_type, make, model, year_of_manufacture, color, license_number) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [plate_number, engine_number, chassis_number, vehicle_type, make, model, year_of_manufacture, color || 'Unknown', license_number]
        );

        // Map ownership record inside driver_owns bridge table
        await conn.query(
            'INSERT INTO driver_owns (license_number, plate_number, engine_number, chassis_number) VALUES (?, ?, ?, ?)',
            [license_number, plate_number, engine_number, chassis_number]
        );

        await conn.commit();
        res.status(201).json({ success: true });
    } catch (err) {
        if (conn) await conn.rollback();
        console.error('Vehicle entry transaction aborted:', err);
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ error: 'A vehicle with this composite identity already exists.' });
        }
        res.status(500).json({ success: false, error: 'Failed to fully record vehicle registries.' });
    } finally {
        if (conn) conn.release();
    }
};


export const updateVehicle = async (req, res) => {
    const { plate_number, engine_number, chassis_number, make, model, vehicle_type, year_of_manufacture, color, license_number } = req.body;
    let conn;
    try {
        conn = await pool.getConnection();
        const result = await conn.query(
            'UPDATE vehicle SET make = ?, model = ?, vehicle_type = ?, year_of_manufacture = ?, color = ?, license_number = ? WHERE plate_number = ? AND engine_number = ? AND chassis_number = ?',
            [make, model, vehicle_type, year_of_manufacture, color, license_number, plate_number, engine_number, chassis_number]
        );
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Vehicle not found' });
        res.status(200).json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Failed to update vehicle data.' });
    } finally {
        if (conn) conn.release();
    }
};


export const deleteVehicle = async (req, res) => {
    const { plate_number } = req.params;
    let conn;
    try {
        conn = await pool.getConnection();
        
        // check, is this vehicle mapped to an active registration?
        const rowsReg = await conn.query(
            "SELECT COUNT(*) as count FROM vehicle_has WHERE plate_number = ?", 
            [plate_number]
        );
        const regCount = Array.isArray(rowsReg) ? rowsReg[0].count : rowsReg.count;

        if (regCount > 0) {
            return res.status(400).json({ 
                error: 'Cannot delete vehicle. It is currently mapped to a registration document. Delete the registration link first.' 
            });
        }

        // If no active registration, delete vehicle
        const result = await conn.query('DELETE FROM vehicle WHERE plate_number = ?', [plate_number]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Vehicle profile not found' });
        }
        res.status(200).json({ message: 'Vehicle record deleted successfully' });

    } catch (err) {
        console.error('SQL Error deleting vehicle:', err);
        res.status(500).json({ error: 'Internal server error while deleting vehicle.' });
    } finally {
        if (conn) conn.release();
    }
};