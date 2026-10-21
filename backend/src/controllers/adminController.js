import pool from '../config/db.js';

export const getDashboardStats = async (req, res, next) => {
  try {
    // 1. Core Counters
    const countsRes = await pool.query(`
      SELECT 
        (SELECT COUNT(*)::int FROM users WHERE role = 'doctor') AS total_doctors,
        (SELECT COUNT(*)::int FROM users WHERE role = 'patient') AS total_patients,
        (SELECT COUNT(*)::int FROM appointments) AS total_appointments,
        (SELECT COUNT(*)::int FROM appointments WHERE appointment_date = CURRENT_DATE) AS today_appointments,
        (SELECT COUNT(*)::int FROM appointments WHERE status = 'completed') AS completed_appointments,
        (SELECT COUNT(*)::int FROM appointments WHERE status = 'pending') AS pending_appointments,
        (SELECT COUNT(*)::int FROM appointments WHERE status = 'confirmed') AS confirmed_appointments,
        (SELECT COUNT(*)::int FROM appointments WHERE status = 'cancelled') AS cancelled_appointments;
    `);

    // 2. Revenue calculation (Sum of consultation fees for completed appointments)
    const revRes = await pool.query(`
      SELECT COALESCE(SUM(d.consultation_fee), 0)::numeric(12, 2) AS total_revenue
      FROM appointments a
      JOIN doctors d ON a.doctor_id = d.id
      WHERE a.status = 'completed';
    `);

    // 3. Department-wise appointment distribution
    const deptStatsRes = await pool.query(`
      SELECT 
        dept.name AS department_name,
        COUNT(a.id)::int AS appointment_count
      FROM departments dept
      LEFT JOIN appointments a ON dept.id = a.department_id
      GROUP BY dept.id, dept.name
      ORDER BY appointment_count DESC;
    `);

    // 4. Recent appointment activity stream
    const recentRes = await pool.query(`
      SELECT 
        a.id,
        a.appointment_date,
        a.time_slot,
        a.status,
        a.created_at,
        u_pat.full_name AS patient_name,
        u_doc.full_name AS doctor_name,
        dept.name AS department_name
      FROM appointments a
      JOIN users u_pat ON a.patient_id = u_pat.id
      JOIN users u_doc ON a.doctor_id = u_doc.id
      LEFT JOIN departments dept ON a.department_id = dept.id
      ORDER BY a.created_at DESC
      LIMIT 6;
    `);

    res.status(200).json({
      success: true,
      data: {
        ...countsRes.rows[0],
        total_revenue: revRes.rows[0].total_revenue,
        department_distribution: deptStatsRes.rows,
        recent_activity: recentRes.rows,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getAllPatients = async (req, res, next) => {
  try {
    const { search } = req.query;

    let queryText = `
      SELECT 
        u.id,
        u.full_name,
        u.email,
        u.phone,
        u.created_at,
        p.date_of_birth,
        p.gender,
        p.blood_group,
        p.address,
        p.emergency_contact,
        p.medical_history,
        COUNT(a.id)::int AS total_appointments,
        MAX(a.appointment_date) AS last_appointment_date
      FROM users u
      LEFT JOIN patients p ON u.id = p.id
      LEFT JOIN appointments a ON u.id = a.patient_id
      WHERE u.role = 'patient'
    `;

    const params = [];
    if (search) {
      params.push(`%${search.trim()}%`);
      queryText += ` AND (u.full_name ILIKE $1 OR u.email ILIKE $1 OR u.phone ILIKE $1)`;
    }

    queryText += ` GROUP BY u.id, p.id ORDER BY u.created_at DESC;`;

    const result = await pool.query(queryText, params);

    res.status(200).json({
      success: true,
      count: result.rows.length,
      data: result.rows,
    });
  } catch (error) {
    next(error);
  }
};
