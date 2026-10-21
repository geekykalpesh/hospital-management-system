import './src/config/bootstrap.js';
import pool from './src/config/db.js';
import bcrypt from 'bcryptjs';

async function seedKalpesh() {
  try {
    const hash = await bcrypt.hash('Kalpesh1234@', 10);
    const res = await pool.query(`
      INSERT INTO users (full_name, email, password_hash, role, phone)
      VALUES ($1, $2, $3, 'admin', $4)
      ON CONFLICT (email) DO UPDATE SET password_hash = $3, role = 'admin'
      RETURNING id, full_name, email, role;
    `, ['Kalpesh (Lead Admin)', 'geekykalpesh@gmail.com', hash, '+91 9876543210']);
    console.log('✅ Kalpesh Admin account successfully seeded in Neon DB:', res.rows[0]);
  } catch (err) {
    console.error('❌ Error seeding Kalpesh account:', err.message);
  } finally {
    await pool.end();
  }
}

seedKalpesh();
