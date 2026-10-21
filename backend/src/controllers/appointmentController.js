import pool from '../config/db.js';

/**
 * Book an appointment
 * Patient books for themselves, or Admin books on behalf
 */
export const createAppointment = async (req, res, next) => {
  try {
    const { doctor_id, department_id, appointment_date, time_slot, symptoms, patient_id } = req.body;

    // Determine target patient ID
    let targetPatientId = req.user.id;
    if (req.user.role === 'admin' && patient_id) {
      targetPatientId = patient_id;
    }

    if (!doctor_id || !appointment_date || !time_slot) {
      return res.status(400).json({
        success: false,
        message: 'Doctor, appointment date, and time slot are required.',
      });
    }

    // Check if slot is already booked for this doctor (excluding cancelled)
    const conflictCheck = await pool.query(
      `SELECT id FROM appointments 
       WHERE doctor_id = $1 AND appointment_date = $2 AND time_slot = $3 AND status != 'cancelled'`,
      [doctor_id, appointment_date, time_slot]
    );

    if (conflictCheck.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'The selected time slot is already booked. Please pick another available slot.',
      });
    }

    // Insert appointment
    const result = await pool.query(
      `INSERT INTO appointments (patient_id, doctor_id, department_id, appointment_date, time_slot, status, symptoms)
       VALUES ($1, $2, $3, $4, $5, 'pending', $6)
       RETURNING *;`,
      [targetPatientId, doctor_id, department_id || null, appointment_date, time_slot, symptoms || null]
    );

    res.status(201).json({
      success: true,
      message: 'Appointment booked successfully! We look forward to your visit.',
      data: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Patient: Get My Appointments
 * Filter: tab = 'upcoming' (future or today, pending/confirmed)
 *         tab = 'history' (past dates OR completed/cancelled)
 */
export const getMyAppointments = async (req, res, next) => {
  try {
    const patientId = req.user.id;
    const { tab } = req.query; // 'upcoming' | 'history'

    let queryText = `
      SELECT 
        a.id,
        a.appointment_date,
        a.time_slot,
        a.status,
        a.symptoms,
        a.cancellation_reason,
        a.created_at,
        u_doc.full_name AS doctor_name,
        u_doc.phone AS doctor_phone,
        u_doc.avatar_url AS doctor_avatar,
        d.specialization,
        d.qualification,
        d.room_number,
        d.consultation_fee,
        dept.name AS department_name,
        p.id AS prescription_id,
        p.diagnosis,
        p.medicines,
        p.doctor_notes,
        p.follow_up_date
      FROM appointments a
      JOIN users u_doc ON a.doctor_id = u_doc.id
      JOIN doctors d ON a.doctor_id = d.id
      LEFT JOIN departments dept ON a.department_id = dept.id
      LEFT JOIN prescriptions p ON a.id = p.appointment_id
      WHERE a.patient_id = $1
    `;

    const params = [patientId];

    if (tab === 'history') {
      queryText += ` AND (a.appointment_date < CURRENT_DATE OR a.status IN ('completed', 'cancelled'))
                     ORDER BY a.appointment_date DESC, a.created_at DESC;`;
    } else {
      // Default to upcoming
      queryText += ` AND (a.appointment_date >= CURRENT_DATE AND a.status IN ('pending', 'confirmed'))
                     ORDER BY a.appointment_date ASC, a.created_at ASC;`;
    }

    const result = await pool.query(queryText, params);
    res.status(200).json({
      success: true,
      tab: tab || 'upcoming',
      count: result.rows.length,
      data: result.rows,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Doctor: Get Assigned Appointments
 * Filter: filter = 'today' | 'upcoming' | 'history'
 */
export const getDoctorAppointments = async (req, res, next) => {
  try {
    const doctorId = req.user.id;
    const { filter, status } = req.query;

    let queryText = `
      SELECT 
        a.id,
        a.appointment_date,
        a.time_slot,
        a.status,
        a.symptoms,
        a.cancellation_reason,
        a.created_at,
        u_pat.id AS patient_id,
        u_pat.full_name AS patient_name,
        u_pat.email AS patient_email,
        u_pat.phone AS patient_phone,
        pat.date_of_birth,
        pat.gender,
        pat.blood_group,
        pat.medical_history,
        p.id AS prescription_id,
        p.diagnosis,
        p.medicines,
        p.doctor_notes,
        p.follow_up_date
      FROM appointments a
      JOIN users u_pat ON a.patient_id = u_pat.id
      LEFT JOIN patients pat ON a.patient_id = pat.id
      LEFT JOIN prescriptions p ON a.id = p.appointment_id
      WHERE a.doctor_id = $1
    `;

    const params = [doctorId];

    if (filter === 'today') {
      queryText += ` AND a.appointment_date = CURRENT_DATE`;
    } else if (filter === 'upcoming') {
      queryText += ` AND a.appointment_date > CURRENT_DATE AND a.status IN ('pending', 'confirmed')`;
    } else if (filter === 'history') {
      queryText += ` AND (a.appointment_date < CURRENT_DATE OR a.status IN ('completed', 'cancelled'))`;
    }

    if (status) {
      params.push(status);
      queryText += ` AND a.status = $${params.length}`;
    }

    queryText += ` ORDER BY a.appointment_date DESC, a.created_at DESC;`;

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

/**
 * Admin: Get All Hospital Appointments (Complete Master Ledger)
 */
export const getAllAppointments = async (req, res, next) => {
  try {
    const { status, doctor_id, department_id, date_from, date_to, search } = req.query;

    let queryText = `
      SELECT 
        a.id,
        a.appointment_date,
        a.time_slot,
        a.status,
        a.symptoms,
        a.cancellation_reason,
        a.created_at,
        u_pat.id AS patient_id,
        u_pat.full_name AS patient_name,
        u_pat.email AS patient_email,
        u_pat.phone AS patient_phone,
        u_doc.id AS doctor_id,
        u_doc.full_name AS doctor_name,
        d.specialization,
        d.room_number,
        d.consultation_fee,
        dept.id AS department_id,
        dept.name AS department_name,
        p.id AS prescription_id,
        p.diagnosis
      FROM appointments a
      JOIN users u_pat ON a.patient_id = u_pat.id
      JOIN users u_doc ON a.doctor_id = u_doc.id
      JOIN doctors d ON a.doctor_id = d.id
      LEFT JOIN departments dept ON a.department_id = dept.id
      LEFT JOIN prescriptions p ON a.id = p.appointment_id
      WHERE 1=1
    `;

    const params = [];

    if (status && status !== 'all') {
      params.push(status);
      queryText += ` AND a.status = $${params.length}`;
    }

    if (doctor_id) {
      params.push(doctor_id);
      queryText += ` AND a.doctor_id = $${params.length}`;
    }

    if (department_id) {
      params.push(department_id);
      queryText += ` AND a.department_id = $${params.length}`;
    }

    if (date_from) {
      params.push(date_from);
      queryText += ` AND a.appointment_date >= $${params.length}`;
    }

    if (date_to) {
      params.push(date_to);
      queryText += ` AND a.appointment_date <= $${params.length}`;
    }

    if (search) {
      params.push(`%${search.trim()}%`);
      queryText += ` AND (u_pat.full_name ILIKE $${params.length} OR u_doc.full_name ILIKE $${params.length} OR u_pat.email ILIKE $${params.length})`;
    }

    queryText += ` ORDER BY a.appointment_date DESC, a.created_at DESC;`;

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

/**
 * Cancel an appointment
 */
export const cancelAppointment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { cancellation_reason } = req.body;

    // Verify appointment exists
    const appRes = await pool.query('SELECT * FROM appointments WHERE id = $1', [id]);
    if (appRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Appointment not found.' });
    }

    const app = appRes.rows[0];

    // Check authorization: must be Admin, or the Patient who booked, or the Doctor assigned
    if (req.user.role !== 'admin' && req.user.id !== app.patient_id && req.user.id !== app.doctor_id) {
      return res.status(403).json({ success: false, message: 'Unauthorized to cancel this appointment.' });
    }

    if (app.status === 'completed') {
      return res.status(400).json({ success: false, message: 'Completed appointments cannot be cancelled.' });
    }

    const updated = await pool.query(
      `UPDATE appointments
       SET status = 'cancelled',
           cancellation_reason = COALESCE($1, 'Cancelled by user'),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING *;`,
      [cancellation_reason || 'Cancelled by user', id]
    );

    res.status(200).json({
      success: true,
      message: 'Appointment has been cancelled successfully.',
      data: updated.rows[0],
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update Appointment Status (Doctor or Admin)
 */
export const updateAppointmentStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['pending', 'confirmed', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
      });
    }

    const result = await pool.query(
      `UPDATE appointments
       SET status = $1,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING *;`,
      [status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Appointment not found.' });
    }

    res.status(200).json({
      success: true,
      message: `Appointment status updated to '${status}'.`,
      data: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Doctor submits Prescription & completes appointment
 */
export const submitPrescription = async (req, res, next) => {
  const client = await pool.connect();
  try {
    const { id } = req.params; // appointment_id
    const { diagnosis, medicines, doctor_notes, follow_up_date } = req.body;

    if (!diagnosis) {
      return res.status(400).json({ success: false, message: 'Clinical diagnosis is required.' });
    }

    // Verify appointment belongs to this doctor
    const appRes = await client.query('SELECT * FROM appointments WHERE id = $1', [id]);
    if (appRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Appointment not found.' });
    }

    const appointment = appRes.rows[0];
    if (req.user.role !== 'admin' && appointment.doctor_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Only the assigned doctor can prescribe.' });
    }

    await client.query('BEGIN');

    // 1. Insert or update prescription
    const presRes = await client.query(
      `INSERT INTO prescriptions (appointment_id, doctor_id, patient_id, diagnosis, medicines, doctor_notes, follow_up_date)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (appointment_id) 
       DO UPDATE SET 
         diagnosis = EXCLUDED.diagnosis,
         medicines = EXCLUDED.medicines,
         doctor_notes = EXCLUDED.doctor_notes,
         follow_up_date = EXCLUDED.follow_up_date
       RETURNING *;`,
      [
        id,
        appointment.doctor_id,
        appointment.patient_id,
        diagnosis,
        JSON.stringify(medicines || []),
        doctor_notes || null,
        follow_up_date || null,
      ]
    );

    // 2. Mark appointment as completed
    await client.query(
      `UPDATE appointments SET status = 'completed', updated_at = CURRENT_TIMESTAMP WHERE id = $1;`,
      [id]
    );

    await client.query('COMMIT');

    res.status(201).json({
      success: true,
      message: 'Consultation completed and prescription saved successfully!',
      prescription: presRes.rows[0],
    });
  } catch (error) {
    await client.query('ROLLBACK');
    next(error);
  } finally {
    client.release();
  }
};
