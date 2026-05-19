import pool from '../pool.js';


// GET ALL VIOLATIONS
export const getViolations = async (req, res) => {
    let conn;
    try {
        conn = await pool.getConnection();
        const violations = await conn.query(`
            SELECT v.*, vt.violation_type 
            FROM violation v
            LEFT JOIN violation_type vt ON v.violation_id = vt.violation_id
        `);
        res.status(200).json(violations);
    } catch (err) {
        console.error('Error fetching violations:', err);
        res.status(500).json({ error: 'Failed to fetch violations' });
    } finally {
        if (conn) conn.release();
    }
};


// GET VIOLATION BY ID
export const getViolationById = async (req, res) => {
    const { id } = req.params;
    let conn;
    try {
        conn = await pool.getConnection();
        const violation = await conn.query(`
            SELECT v.*, vt.violation_type 
            FROM violation v
            LEFT JOIN violation_type vt ON v.violation_id = vt.violation_id
            WHERE v.violation_id = ?
        `, [id]);
        
        if (violation.length === 0) {
            return res.status(404).json({ error: 'Violation profile not found' });
        }
        res.status(200).json(violation[0]);
    } catch (err) {
        console.error('Error fetching violation:', err);
        res.status(500).json({ error: 'Failed to fetch violation' });
    } finally {
        if (conn) conn.release();
    }
};


// CREATE VIOLATION 
export const createViolation = async (req, res) => {
    const { 
        violation_date, 
        violation_location, 
        violation_type, 
        fine_amount, 
        apprehending_officer, 
        violation_status, 
        license_number,       // The offending driver
        registration_number   // The associated vehicle registration
    } = req.body;

    let conn;
    try {
        conn = await pool.getConnection();

        const ownershipCheck = await conn.query(`
            SELECT v.license_number AS actual_owner
            FROM vehicle_has vh
            JOIN vehicle v 
              ON vh.plate_number = v.plate_number 
             AND vh.engine_number = v.engine_number 
             AND vh.chassis_number = v.chassis_number
            WHERE vh.registration_number = ?
        `, [registration_number]);

        // If the registration exists but the owner doesn't match the offender
        if (ownershipCheck.length === 0) {
            return res.status(400).json({ 
                error: `Validation Error: Registration number ${registration_number} could not be matched to any vehicle asset.` 
            });
        }

        if (ownershipCheck[0].actual_owner !== license_number) {
            return res.status(400).json({ 
                error: `LTO Restriction: The selected driver (${license_number}) does not own the vehicle tied to registration ${registration_number}. You cannot issue this citation.` 
            });
        }

        await conn.beginTransaction();

        const result = await conn.query(`
            INSERT INTO violation 
            (violation_date, violation_location, violation_status, fine_amount, license_number, registration_number) 
            VALUES (?, ?, ?, ?, ?, ?)
        `, [violation_date, violation_location, violation_status, fine_amount, license_number, registration_number]);
        
        await conn.commit();
        res.status(201).json({ success: true });

    } catch (err) {
        if (conn) await conn.rollback();
        console.error('Error creating violation record:', err);
        res.status(500).json({ success: false, error: 'Failed to record the traffic violation.' });
    } finally {
        if (conn) conn.release();
    }
};


// UPDATE VIOLATION
export const updateViolation = async (req, res) => {
    const { id } = req.params;
    const { violation_date, violation_location, violation_status, fine_amount, apprehending_officer } = req.body;
    let conn;
    try {
        conn = await pool.getConnection();
        const result = await conn.query(
            'UPDATE violation SET violation_date = ?, violation_location = ?, violation_status = ?, fine_amount = ?, apprehending_officer = ? WHERE violation_id = ?',
            [violation_date, violation_location, violation_status, fine_amount, apprehending_officer, id]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Violation record not found' });
        }
        res.status(200).json({ success: true });
    } catch (err) {
        console.error('Error updating violation details:', err);
        res.status(500).json({ success: false, error: 'Failed to update violation.' });
    } finally {
        if (conn) conn.release();
    }
};


// DELETE VIOLATION
export const deleteViolation = async (req, res) => {
    const { violation_id } = req.params;
    let conn;
    try {
        conn = await pool.getConnection();
        
        // 1. PROACTIVE CHECK: Is the violation unpaid?
        const rows = await conn.query(
            "SELECT violation_status FROM violation WHERE violation_id = ?", 
            [violation_id]
        );
        
        if (rows.length > 0) {
            const status = Array.isArray(rows) ? rows[0].violation_status : rows.violation_status;
            if (status === 'Unpaid') {
                return res.status(400).json({ 
                    error: 'Cannot delete an Unpaid violation. The fine must be marked as Paid or Contested first.' 
                });
            }
        }

        // 2. Proceed to delete if Paid
        const result = await conn.query('DELETE FROM violation WHERE violation_id = ?', [violation_id]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Violation record not found' });
        }
        res.status(200).json({ message: 'Violation record dropped successfully' });

    } catch (err) {
        console.error('SQL Error deleting violation:', err);
        res.status(500).json({ error: 'Internal failure processing citation deletion.' });
    } finally {
        if (conn) conn.release();
    }
};