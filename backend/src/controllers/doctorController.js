import bcrypt from 'bcryptjs';
import pool from '../config/db.js';

export const getDoctors = async (req, res, next) => {
  try {
    const { department_id, search, available_only } = req.query;

    let queryText = `
      SELECT 
        u.id,
        u.full_name,
        u.email,
        u.phone,
        u.avatar_url,
        d.department_id,
        dept.name AS department_name,
        d.specialization,
        d.qualification,
        d.experience_years,
        d.consultation_fee,
        d.room_number,
        d.available_days,
        d.shift_start,
        d.shift_end,
        d.is_available,
        d.bio
      FROM doctors d
      JOIN users u ON d.id = u.id
      LEFT JOIN departments dept ON d.department_id = dept.id
      WHERE u.role = 'doctor'
    `;

    const params = [];

    if (department_id) {
      params.push(department_id);
      queryText += ` AND d.department_id = $${params.length}`;
    }

    if (available_only === 'true') {
      queryText += ` AND d.is_available = TRUE`;
    }

    if (search) {
      params.push(`%${search.trim()}%`);
      queryText += ` AND (u.full_name ILIKE $${params.length} OR d.specialization ILIKE $${params.length} OR dept.name ILIKE $${params.length})`;
    }

    queryText += ` ORDER BY u.full_name ASC;`;

    const result = await pool.query(queryText, params);
    res.status(200).json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    next(error);
  }
};

export const getDoctorById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT 
        u.id,
        u.full_name,
        u.email,
        u.phone,
        u.avatar_url,
        d.department_id,
        dept.name AS department_name,
        d.specialization,
        d.qualification,
        d.experience_years,
        d.consultation_fee,
        d.room_number,
        d.available_days,
        d.shift_start,
        d.shift_end,
        d.is_available,
        d.bio
      FROM doctors d
      JOIN users u ON d.id = u.id
      LEFT JOIN departments dept ON d.department_id = dept.id
      WHERE d.id = $1;`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Doctor not found.' });
    }

    res.status(200).json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
};

export const getAvailableSlots = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({ success: false, message: 'Date query parameter is required (YYYY-MM-DD).' });
    }

    // 1. Fetch Doctor Shift
    const docRes = await pool.query(
      `SELECT shift_start, shift_end, available_days, is_available FROM doctors WHERE id = $1`,
      [id]
    );

    if (docRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Doctor not found.' });
    }

    const doctor = docRes.rows[0];
    if (!doctor.is_available) {
      return res.status(200).json({
        success: true,
        message: 'Doctor is currently marked as unavailable.',
        slots: [],
      });
    }

    // Check if the given date matches doctor's available days
    const targetDate = new Date(date + 'T00:00:00');
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const targetDayName = dayNames[targetDate.getDay()];

    const availableDays = Array.isArray(doctor.available_days)
      ? doctor.available_days
      : JSON.parse(doctor.available_days || '[]');

    if (!availableDays.includes(targetDayName)) {
      return res.status(200).json({
        success: true,
        message: `Doctor does not hold clinic on ${targetDayName}s.`,
        slots: [],
      });
    }

    // 2. Fetch already booked slots for this doctor on this date
    const bookedRes = await pool.query(
      `SELECT time_slot FROM appointments 
       WHERE doctor_id = $1 AND appointment_date = $2 AND status != 'cancelled'`,
      [id, date]
    );

    const bookedSlotsSet = new Set(bookedRes.rows.map(r => r.time_slot));

    // 3. Generate standard 30-minute interval slots between shift_start and shift_end
    const [startH, startM] = (doctor.shift_start || '09:00:00').split(':').map(Number);
    const [endH, endM] = (doctor.shift_end || '17:00:00').split(':').map(Number);

    const startMinutes = startH * 60 + startM;
    const endMinutes = endH * 60 + endM;

    const slots = [];
    for (let m = startMinutes; m < endMinutes; m += 30) {
      const h = Math.floor(m / 60);
      const min = m % 60;
      const period = h >= 12 ? 'PM' : 'AM';
      const displayH = h % 12 === 0 ? 12 : h % 12;
      const displayMin = min < 10 ? `0${min}` : min;
      const slotLabel = `${displayH}:${displayMin} ${period}`;

      slots.push({
        slot: slotLabel,
        is_booked: bookedSlotsSet.has(slotLabel),
      });
    }

    res.status(200).json({
      success: true,
      date,
      day: targetDayName,
      slots,
    });
  } catch (error) {
    next(error);
  }
};

export const createDoctor = async (req, res, next) => {
  const client = await pool.connect();
  try {
    const {
      full_name,
      email,
      password,
      phone,
      department_id,
      specialization,
      qualification,
      experience_years,
      consultation_fee,
      room_number,
      available_days,
      shift_start,
      shift_end,
      bio,
    } = req.body;

    if (!full_name || !email || !password || !specialization || !qualification) {
      return res.status(400).json({
        success: false,
        message: 'Full name, email, password, specialization, and qualification are required.',
      });
    }

    const existing = await client.query('SELECT id FROM users WHERE email = $1', [email.toLowerCase().trim()]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ success: false, message: 'An account with this email already exists.' });
    }

    await client.query('BEGIN');

    const passwordHash = await bcrypt.hash(password, 10);

    const userRes = await client.query(
      `INSERT INTO users (full_name, email, password_hash, role, phone)
       VALUES ($1, $2, $3, 'doctor', $4)
       RETURNING id, full_name, email, role, phone, created_at;`,
      [full_name.trim(), email.toLowerCase().trim(), passwordHash, phone || null]
    );

    const doctorId = userRes.rows[0].id;

    await client.query(
      `INSERT INTO doctors (id, department_id, specialization, qualification, experience_years, consultation_fee, room_number, available_days, shift_start, shift_end, bio)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11);`,
      [
        doctorId,
        department_id || null,
        specialization.trim(),
        qualification.trim(),
        experience_years || 0,
        consultation_fee || 50.00,
        room_number || null,
        JSON.stringify(available_days || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']),
        shift_start || '09:00:00',
        shift_end || '17:00:00',
        bio || null,
      ]
    );

    await client.query('COMMIT');

    res.status(201).json({
      success: true,
      message: `Doctor ${full_name} profile created successfully.`,
      doctor: {
        id: doctorId,
        full_name,
        email,
        specialization,
        qualification,
      },
    });
  } catch (error) {
    await client.query('ROLLBACK');
    next(error);
  } finally {
    client.release();
  }
};

export const updateDoctor = async (req, res, next) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;
    const {
      full_name,
      phone,
      department_id,
      specialization,
      qualification,
      experience_years,
      consultation_fee,
      room_number,
      available_days,
      shift_start,
      shift_end,
      is_available,
      bio,
    } = req.body;

    // Check permissions: either Admin or doctor updating own profile
    if (req.user.role !== 'admin' && req.user.id !== id) {
      return res.status(403).json({ success: false, message: 'You are not authorized to update this doctor.' });
    }

    await client.query('BEGIN');

    if (full_name || phone) {
      await client.query(
        `UPDATE users
         SET full_name = COALESCE($1, full_name),
             phone = COALESCE($2, phone),
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $3;`,
        [full_name ? full_name.trim() : null, phone, id]
      );
    }

    await client.query(
      `UPDATE doctors
       SET department_id = COALESCE($1, department_id),
           specialization = COALESCE($2, specialization),
           qualification = COALESCE($3, qualification),
           experience_years = COALESCE($4, experience_years),
           consultation_fee = COALESCE($5, consultation_fee),
           room_number = COALESCE($6, room_number),
           available_days = COALESCE($7, available_days),
           shift_start = COALESCE($8, shift_start),
           shift_end = COALESCE($9, shift_end),
           is_available = COALESCE($10, is_available),
           bio = COALESCE($11, bio)
       WHERE id = $12;`,
      [
        department_id,
        specialization,
        qualification,
        experience_years,
        consultation_fee,
        room_number,
        available_days ? JSON.stringify(available_days) : null,
        shift_start,
        shift_end,
        is_available,
        bio,
        id,
      ]
    );

    await client.query('COMMIT');

    res.status(200).json({
      success: true,
      message: 'Doctor profile updated successfully.',
    });
  } catch (error) {
    await client.query('ROLLBACK');
    next(error);
  } finally {
    client.release();
  }
};

export const deleteDoctor = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM users WHERE id = $1 AND role = $2 RETURNING id', [id, 'doctor']);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Doctor not found.' });
    }

    res.status(200).json({
      success: true,
      message: 'Doctor deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};
