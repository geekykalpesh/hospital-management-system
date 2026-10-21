import bcrypt from 'bcryptjs';
import pool from '../config/db.js';
import { signToken } from '../utils/jwt.js';

export const registerPatient = async (req, res, next) => {
  const client = await pool.connect();
  try {
    const {
      full_name,
      email,
      password,
      phone,
      date_of_birth,
      gender,
      blood_group,
      address,
      emergency_contact,
      medical_history,
    } = req.body;

    if (!full_name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Full name, email, and password are required.',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.',
      });
    }

    // Check if user already exists
    const existing = await client.query('SELECT id FROM users WHERE email = $1', [email.toLowerCase().trim()]);
    if (existing.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email address already exists. Please log in.',
      });
    }

    await client.query('BEGIN');

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Insert user
    const userResult = await client.query(
      `INSERT INTO users (full_name, email, password_hash, role, phone)
       VALUES ($1, $2, $3, 'patient', $4)
       RETURNING id, full_name, email, role, phone, created_at;`,
      [full_name.trim(), email.toLowerCase().trim(), passwordHash, phone || null]
    );

    const newUser = userResult.rows[0];

    // Insert patient profile
    await client.query(
      `INSERT INTO patients (id, date_of_birth, gender, blood_group, address, emergency_contact, medical_history)
       VALUES ($1, $2, $3, $4, $5, $6, $7);`,
      [
        newUser.id,
        date_of_birth || null,
        gender || null,
        blood_group || null,
        address || null,
        emergency_contact || null,
        medical_history || null,
      ]
    );

    await client.query('COMMIT');

    const token = signToken({
      id: newUser.id,
      email: newUser.email,
      role: newUser.role,
      full_name: newUser.full_name,
    });

    res.status(201).json({
      success: true,
      message: 'Account registered successfully. Welcome to the hospital portal!',
      token,
      user: {
        id: newUser.id,
        full_name: newUser.full_name,
        email: newUser.email,
        role: newUser.role,
        phone: newUser.phone,
        created_at: newUser.created_at,
      },
    });
  } catch (error) {
    await client.query('ROLLBACK');
    next(error);
  } finally {
    client.release();
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password.',
      });
    }

    const userResult = await pool.query(
      'SELECT id, full_name, email, password_hash, role, phone, avatar_url, created_at FROM users WHERE email = $1',
      [email.toLowerCase().trim()]
    );

    if (userResult.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    const user = userResult.rows[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    // Role-specific profile enrichments
    let profileData = {};
    if (user.role === 'doctor') {
      const docRes = await pool.query(
        `SELECT d.*, dept.name AS department_name 
         FROM doctors d
         LEFT JOIN departments dept ON d.department_id = dept.id
         WHERE d.id = $1`,
        [user.id]
      );
      if (docRes.rows.length > 0) {
        profileData = docRes.rows[0];
      }
    } else if (user.role === 'patient') {
      const patRes = await pool.query('SELECT * FROM patients WHERE id = $1', [user.id]);
      if (patRes.rows.length > 0) {
        profileData = patRes.rows[0];
      }
    }

    const token = signToken({
      id: user.id,
      email: user.email,
      role: user.role,
      full_name: user.full_name,
    });

    res.status(200).json({
      success: true,
      message: `Welcome back, ${user.full_name}!`,
      token,
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        avatar_url: user.avatar_url,
        created_at: user.created_at,
        profile: profileData,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req, res, next) => {
  try {
    const user = req.user;
    let profileData = {};

    if (user.role === 'doctor') {
      const docRes = await pool.query(
        `SELECT d.*, dept.name AS department_name 
         FROM doctors d
         LEFT JOIN departments dept ON d.department_id = dept.id
         WHERE d.id = $1`,
        [user.id]
      );
      if (docRes.rows.length > 0) {
        profileData = docRes.rows[0];
      }
    } else if (user.role === 'patient') {
      const patRes = await pool.query('SELECT * FROM patients WHERE id = $1', [user.id]);
      if (patRes.rows.length > 0) {
        profileData = patRes.rows[0];
      }
    }

    res.status(200).json({
      success: true,
      user: {
        ...user,
        profile: profileData,
      },
    });
  } catch (error) {
    next(error);
  }
};
