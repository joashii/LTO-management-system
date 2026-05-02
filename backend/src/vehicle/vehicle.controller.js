import pool from '../pool.js';

export const getVehicles = async (req, res) => {
    let conn;
    try {
        conn = await pool.getConnection();
        const vehicles = await conn.query('SELECT * FROM vehicle');
        res.status(200).json(vehicles);
    } catch (err) {
        console.error('Error fetching vehicles:', err);
        res.status(500).json({ error: 'Failed to fetch vehicles' });
    } finally {
        if (conn) conn.release();
    }
}

export const getVehicleById = async (req, res) => {
    let conn;
    try {
        conn = await pool.getConnection();
        const vehicle = await conn.query('SELECT * FROM vehicle WHERE plate_number = ? AND engine_number = ? AND chassis_number = ?', [req.params.plate_number, req.params.engine_number, req.params.chassis_number]);
        if (vehicle.length === 0) {
            return res.status(404).json({ error: 'Vehicle not found' });
        }
        res.status(200).json(vehicle[0]);
    } catch (err) {
        console.error('Error fetching vehicle:', err);
        res.status(500).json({ error: 'Failed to fetch vehicle' });
    } finally {
        if (conn) conn.release();
    }
}

export const createVehicle = async (req, res) => {
    const { 
        plate_number, 
        engine_number, 
        chassis_number, 
        make, 
        model, 
        vehicle_type,
        year_of_manufacture, 
        license_number, 
        registration_number 
    } = req.body;

    let conn;
    try {
        conn = await pool.getConnection();
        const result = await conn.query(
            'INSERT INTO vehicle (plate_number, engine_number, chassis_number, vehicle_type, make, model, year_of_manufacture, license_number, registration_number) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [plate_number, engine_number, chassis_number, vehicle_type, make, model, year_of_manufacture, license_number, registration_number]
        );
        res.status(201).json({ success: true });
    } catch (err) {
        console.error('Error creating vehicle:', err);
        res.status(500).json({ success: false, error: 'Failed to create vehicle' });
    } finally {
        if (conn) conn.release();
    }
}

export const updateVehicle = async (req, res) => {
    const { 
        plate_number, 
        engine_number, 
        chassis_number, 
        make, 
        model, 
        vehicle_type,
        year_of_manufacture, 
        license_number, 
        registration_number 
    } = req.body;

    let conn;
    try {
        conn = await pool.getConnection();
        const result = await conn.query(
            'UPDATE vehicle SET make = ?, model = ?, vehicle_type = ?, year_of_manufacture = ?, license_number = ?, registration_number = ? WHERE plate_number = ? AND engine_number = ? AND chassis_number = ?',
            [make, model, vehicle_type, year_of_manufacture, license_number, registration_number, plate_number, engine_number, chassis_number]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Vehicle not found' });
        }
        res.status(200).json({ success: true });
    } catch (err) {
        console.error('Error updating vehicle:', err);
        res.status(500).json({ success: false, error: 'Failed to update vehicle' });
    } finally {
        if (conn) conn.release();
    }
}

export const deleteVehicle = async (req, res) => {
    let conn;
    try {
        conn = await pool.getConnection();
        const result = await conn.query('DELETE FROM vehicle WHERE plate_number = ? AND engine_number = ? AND chassis_number = ?', [req.params.plate_number, req.params.engine_number, req.params.chassis_number]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Vehicle not found' });
        }
        res.status(200).json({ success: true });
    } catch (err) {
        console.error('Error deleting vehicle:', err);
        res.status(500).json({ success: false, error: 'Failed to delete vehicle' });
    } finally {
        if (conn) conn.release();
    }
}

// TODO : ADD TO CREATE FUNCTION 

// Link Vehicle PK, to registration number
// If vehicle is deleted/updated....

export const vehicleHas = async (registration_number, plate_number, engine_number, engine_number, chassis_number) => {
    let conn;
    try {
        conn = await pool.getConnection();
        await conn.query(
            'INSERT INTO vehicle_has (registration_number, plate_number, engine_number, chassis_number) VALUES (?, ?, ?, ?)',
            [registration_number, plate_number, engine_number, chassis_number]
        );
    } catch (err) {
        console.error('Error linking vehicle to registration:', err);
    } finally {
        if (conn) conn.release();
    }
}