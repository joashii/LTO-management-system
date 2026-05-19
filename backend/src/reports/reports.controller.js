import pool from "../pool.js";

// Report 1: Filter Drivers
// default is Non Pro, Active, Male, 18 - 60
export const report1 = async (req, res) => {
  const {
    license_type = "Non-Professional",
    license_status = "Active",
    sex = "Male",
    min_age = 18,
    max_age = 60,
  } = req.query;

  let conn;

  try {
    conn = await pool.getConnection();

    const query = `
            SELECT * FROM driver
            WHERE license_type = ?
                AND license_status = ?
                AND sex = ?
                AND (YEAR(CURDATE()) - YEAR(date_of_birth)) BETWEEN ? AND ?;
        `;

    const result = await conn.query(query, [
      license_type,
      license_status,
      sex,
      min_age,
      max_age,
    ]);

    res.status(200).json(result);
  } catch (err) {
    console.error("Error executing report 1:", err);
    res.status(500).json({ error: "Failed to execute report 1" });
  } finally {
    if (conn) conn.release();
  }
};

// Report 2: Find Vehicles owned by a Driver License ID
export const report2 = async (req, res) => {
  const { license_number } = req.params;
  let conn;

  try {
    conn = await pool.getConnection();

    const query = `
            SELECT v.plate_number, v.make, v.model, v.color, v.year_of_manufacture
            FROM vehicle v
            JOIN driver_owns d 
              ON v.plate_number = d.plate_number
              AND v.engine_number = d.engine_number
              AND v.chassis_number = d.chassis_number
            WHERE d.license_number = ?;
        `;

    const result = await conn.query(query, [license_number]);

    res.status(200).json(result);
  } catch (err) {
    console.error("Error executing report 2:", err);
    res.status(500).json({ error: "Failed to execute report 2" });
  } finally {
    if (conn) conn.release();
  }
};

// Report 3: Find Vehicles with Expired Registrations
export const report3 = async (req, res) => {
  const { expiration_date } = req.params;
  let conn;

  try {
    conn = await pool.getConnection();

    const query = `
            SELECT v.plate_number, v.make, v.model, v.color, r.expiration_date
            FROM vehicle v 
            JOIN vehicle_has vh
              ON v.plate_number = vh.plate_number
              AND v.engine_number = vh.engine_number
              AND v.chassis_number = vh.chassis_number
            JOIN registration r 
              ON vh.registration_number = r.registration_number
            WHERE r.expiration_date < ?;
        `;

    const result = await conn.query(query, [expiration_date]);

    res.status(200).json(result);
  } catch (err) {
    console.error("Error executing report 3:", err);
    res.status(500).json({ error: "Failed to execute report 3" });
  } finally {
    if (conn) conn.release();
  }
};

// Report 4: Driver license status Checklist
// default is suspended
export const report4 = async (req, res) => {
  const { license_status } = req.params;
  let conn;

  try {
    conn = await pool.getConnection();

    const query = `
            SELECT license_number, full_name, license_status, license_expiration
            FROM driver
            WHERE license_status = ?
               OR license_expiration < CURRENT_DATE;
        `;

    const result = await conn.query(query, [license_status]);

    res.status(200).json(result);
  } catch (err) {
    console.error("Error executing report 4:", err);
    res.status(500).json({ error: "Failed to execute report 4" });
  } finally {
    if (conn) conn.release();
  }
};

// Report 5: Traffic Violations within Date Range
export const report5 = async (req, res) => {
  const { license_number, start_date, end_date } = req.params;
  let conn;

  try {
    conn = await pool.getConnection();

    const query = `
            SELECT v.violation_id, vt.violation_type, v.violation_date,
                   v.violation_location, v.violation_status, v.fine_amount
            FROM violation v 
            JOIN violation_type vt ON v.violation_id = vt.violation_id
            WHERE v.license_number = ?
              AND v.violation_date BETWEEN ? AND ?;
        `;

    const result = await conn.query(query, [
      license_number,
      start_date,
      end_date,
    ]);

    res.status(200).json(result);
  } catch (err) {
    console.error("Error executing report 5:", err);
    res.status(500).json({ error: "Failed to execute report 5" });
  } finally {
    if (conn) conn.release();
  }
};

// Report 6: Total Violations Per Category
export const report6 = async (req, res) => {
  const { year } = req.params;

  let conn;

  try {
    conn = await pool.getConnection();

    const query = `
      SELECT
        vt.violation_type,
        COUNT(*) AS total_violations
      FROM violation v
      JOIN violation_type vt
        ON v.violation_id = vt.violation_id
      WHERE YEAR(v.violation_date) = ?
      GROUP BY vt.violation_type;
    `;

    const result = await conn.query(query, [year]);

    // Convert BigInt values to Number
    const formattedResult = result.map((row) => ({
      ...row,
      total_violations: Number(row.total_violations),
    }));

    res.status(200).json(formattedResult);
  } catch (err) {
    console.error("Error executing report 6:", err);

    res.status(500).json({
      error: "Failed to execute report 6",
    });
  } finally {
    if (conn) conn.release();
  }
};

// Report 7: Geographic Infraction Search Profile
export const report7 = async (req, res) => {
  const { location } = req.params;
  let conn;

  try {
    conn = await pool.getConnection();

    const query = `
            SELECT v.plate_number, v.make, v.model, v.color,
                   vi.violation_location, vi.violation_date
            FROM involved_in i
            JOIN vehicle v
              ON i.plate_number = v.plate_number
              AND i.engine_number = v.engine_number
              AND i.chassis_number = v.chassis_number
            JOIN violation vi
              ON i.violation_id = vi.violation_id
            WHERE vi.violation_location LIKE ?;
        `;

    const result = await conn.query(query, [`%${location}%`]);

    res.status(200).json(result);
  } catch (err) {
    console.error("Error executing report 7:", err);
    res.status(500).json({ error: "Failed to execute report 7" });
  } finally {
    if (conn) conn.release();
  }
};

export const generalQuery = async (req, res) => {
  const { query } = req.body;
  let conn;

  try {
    // Ensure query exists
    if (!query || typeof query !== "string") {
      return res.status(400).json({
        error: "Query is required",
      });
    }

    // Remove leading/trailing spaces
    const trimmedQuery = query.trim().toUpperCase();

    // Only allow SELECT statements
    if (
      !trimmedQuery.startsWith("SELECT") &&
      !trimmedQuery.startsWith("DESC") &&
      !trimmedQuery.startsWith("SHOW")
    ) {
      return res.status(403).json({
        error: "Only SELECT, DESC, and SHOW queries are allowed",
      });
    }
    // Block dangerous keywords
    const blockedKeywords = [
      "INSERT",
      "UPDATE",
      "DELETE",
      "DROP",
      "ALTER",
      "TRUNCATE",
      "CREATE",
      "REPLACE",
      "RENAME",
      "GRANT",
      "REVOKE",
    ];

    for (const keyword of blockedKeywords) {
      if (trimmedQuery.includes(keyword)) {
        return res.status(403).json({
          error: `Keyword "${keyword}" is not allowed`,
        });
      }
    }

    conn = await pool.getConnection();

    const result = await conn.query(query);

    res.status(200).json(result);
  } catch (err) {
    console.error("Error executing general query:", err);

    res.status(500).json({
      error: "Failed to execute general query",
    });
  } finally {
    if (conn) conn.release();
  }
};
