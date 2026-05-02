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
        violation_id,
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
            'INSERT INTO violation (violation_id, violation_date, violation_location, violation_status, fine_amount, apprehending_officer, license_number, registration_number) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [violation_id, violation_date, violation_location, violation_status, fine_amount, apprehending_officer, license_number, registration_number]
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
        violation_id,
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
            'UPDATE violation SET violation_id = ?, violation_date = ?, violation_location = ?, violation_status = ?, fine_amount = ?, apprehending_officer = ?, license_number = ?, registration_number = ? WHERE violation_id = ?',
            [violation_id, violation_date, violation_location, violation_status, fine_amount, apprehending_officer, license_number, registration_number, req.params.id]
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

// TODO : LINK TO CRUD FUNCTIONS

// Link Violation with Vehicle PK
export const involvedIn = async (violationId, plate_number, engine_number, chassis_number) => {
    let conn;
    try {
        conn = await pool.getConnection();
        await conn.query(
            'INSERT INTO involved_in (violation_id, plate_number, engine_number, chassis_number) VALUES (?, ?, ?, ?)',
            [violationId, plate_number, engine_number, chassis_number]
        );
    } catch (err) {
        console.error('Error linking violation with vehicle:', err);
        throw err;
    } finally {
        if (conn) conn.release();``
    }
}


// link different types of violations with one violation ID
export const violationType = async (violationId, violationTypes) => {
    let conn;
    try {
        conn = await pool.getConnection();
        for (const type of violationTypes) {
            await conn.query(
                'INSERT INTO violation_type (violation_id, type) VALUES (?, ?)',
                [violationId, type]
            );
        } 
    } catch (err) {
        console.error('Error linking violation with types:', err);
        throw err;
    } finally {
        if (conn) conn.release();
    }
}

// link violation with registration number
export const registrationCommits = async (violationId, registrationNumber) => {
    let conn;
    try {
        conn = await pool.getConnection();
        await conn.query(
            'INSERT INTO registration_commits (violation_id, registration_number) VALUES (?, ?)',
            [violationId, registrationNumber]
        );
    } catch (err) {
        console.error('Error linking violation with registration:', err);
        throw err;
    } finally {
        if (conn) conn.release();
    }
}