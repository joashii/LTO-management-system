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
        license_type, 
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
            'INSERT INTO driver (license_number, license_type, license_status, license_expiration, license_issuance, full_name, sex, date_of_birth, driver_address) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [license_number, license_type, license_status, license_expiration, license_issuance, full_name, sex, date_of_birth, driver_address]
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
        license_type, 
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
            'UPDATE driver SET license_number = ?, license_type = ?, license_status = ?, license_expiration = ?, license_issuance = ?, full_name = ?, sex = ?, date_of_birth = ?, driver_address = ? WHERE license_number = ?',
            [license_number, license_type, license_status, license_expiration, license_issuance, full_name, sex, date_of_birth, driver_address, license_number]
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
    const { license_number } = req.params;
    let conn;
    try {
        conn = await pool.getConnection();

        // check, does this driver have unpaid fines?
        const rowsUnpaid = await conn.query(
            "SELECT COUNT(*) as count FROM violation WHERE license_number = ? AND violation_status = 'Unpaid'", 
            [license_number]
        );
        // MariaDB returns arrays of objects. Depending on your driver, it's either rowsUnpaid[0] or rowsUnpaid.
        const unpaidCount = Array.isArray(rowsUnpaid) ? rowsUnpaid[0].count : rowsUnpaid.count;
        
        if (unpaidCount > 0) {
            return res.status(400).json({ 
                error: `Cannot delete driver. They have ${unpaidCount} unpaid violation(s).` 
            });
        }

        // check, does this driver still own registered vehicles?
        const rowsVehicles = await conn.query(
            "SELECT COUNT(*) as count FROM vehicle WHERE license_number = ?", 
            [license_number]
        );
        const vehicleCount = Array.isArray(rowsVehicles) ? rowsVehicles[0].count : rowsVehicles.count;

        if (vehicleCount > 0) {
            return res.status(400).json({ 
                error: `Cannot delete driver. They still own ${vehicleCount} vehicle(s) in the system.` 
            });
        }

        // If checks pass, delete the driver
        const result = await conn.query('DELETE FROM driver WHERE license_number = ?', [license_number]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Driver profile not found' });
        }
        res.status(200).json({ message: 'Driver record deleted successfully' });

    } catch (err) {
        console.error('SQL Error deleting driver:', err);
        res.status(500).json({ error: 'Internal server error while deleting driver.' });
    } finally {
        if (conn) conn.release();
    }
};

// Link license number, to Vehicle PK
// If driver is deleted/updated....
export const driverOwns = async (license_number, plate_number, engine_number, chassis_number) => {
    let conn;
    try {
        conn = await pool.getConnection();
        await conn.query(
            'INSERT INTO driver_owns (license_number, plate_number, engine_number, chassis_number) VALUES (?, ?, ?, ?)',
            [license_number, plate_number, engine_number, chassis_number]
        );
    } catch (err) {
        console.error('Error linking driver to vehicle:', err);
    } finally {
        if (conn) conn.release();
    }

}

export const getComprehensiveDriverProfile = async (req, res) => {
    const { query } = req.query; // This will accept either full_name search or exact license_number
    
    if (!query) {
        return res.status(400).json({ error: 'Search query parameter is required.' });
    }

    let conn;
    try {
        conn = await pool.getConnection();

        // Locate the core driver record
        const drivers = await conn.query(`
            SELECT * FROM driver 
            WHERE license_number = ? OR full_name LIKE ?
        `, [query, `%${query}%`]);

        if (drivers.length === 0) {
            return res.status(404).json({ error: 'No matching driver registry found.' });
        }

        // We will target the first matched driver profile
        const targetDriver = drivers[0];
        const licenseNo = targetDriver.license_number;

        // Extract all vehicle configurations owned by this driver, 
        const vehicles = await conn.query(`
            SELECT v.*, vh.registration_number, r.registration_status, r.registration_date, r.expiration_date
            FROM vehicle v
            LEFT JOIN vehicle_has vh 
              ON v.plate_number = vh.plate_number 
             AND v.engine_number = vh.engine_number 
             AND v.chassis_number = vh.chassis_number
            LEFT JOIN registration r 
              ON vh.registration_number = r.registration_number
            WHERE v.license_number = ?
        `, [licenseNo]);

        const violations = await conn.query(`
            SELECT * FROM violation 
            WHERE license_number = ?
            ORDER BY violation_date DESC
        `, [licenseNo]);

        const balanceSummary = await conn.query(`
            SELECT SUM(fine_amount) AS total_unpaid 
            FROM violation 
            WHERE license_number = ? AND violation_status = 'Unpaid'
        `, [licenseNo]);

        res.status(200).json({
          driverInfo: targetDriver,
          vehicles: vehicles,
          violations: violations,
          summary: {
            unpaidFines: balanceSummary[0].total_unpaid || 0,
            totalCount: violations.length
          }
        });

    } catch (err) {
        console.error('Master Profile Aggregation Error:', err);
        res.status(500).json({ error: 'Internal failure compiling comprehensive asset profile.' });
    } finally {
        if (conn) conn.release();
    }
};