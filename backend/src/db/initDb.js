import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import pool from '../config/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function initializeDatabase() {
  console.log('----------------------------------------------------');
  console.log('🏥 Starting Hospital Management System DB Setup...');
  console.log('----------------------------------------------------');

  try {
    // 1. Read & Execute Schema
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    
    console.log('[1/4] Applying database schema (DDL)...');
    await pool.query(schemaSql);
    console.log('✅ Tables & indexes verified/created successfully.');

    // 2. Check if DB is already seeded
    const adminCheck = await pool.query("SELECT id FROM users WHERE email = 'admin@hospital.com'");
    if (adminCheck.rows.length > 0) {
      console.log('ℹ️  Database already initialized with seed data. Skipping seed step.');
      await pool.end();
      return;
    }

    console.log('[2/4] Seeding Departments...');
    const deptRows = await pool.query(`
      INSERT INTO departments (name, description, icon_name) VALUES
      ('Cardiology', 'Advanced cardiovascular diagnostics, interventions, and preventive heart care.', 'Heart'),
      ('Neurology', 'Comprehensive neurological care, brain imaging, and spine care.', 'Brain'),
      ('Pediatrics', 'Dedicated care for infants, children, and young adolescents.', 'Baby'),
      ('Orthopedics', 'Joint replacements, sports injuries, fracture management, and spine surgery.', 'Bone'),
      ('Dermatology', 'Advanced dermatological care, allergy treatment, and skin wellness.', 'Sparkles'),
      ('General Medicine', 'Primary care, executive health checkups, and diagnostic screenings.', 'Stethoscope')
      RETURNING id, name;
    `);

    const deptMap = {};
    deptRows.rows.forEach(d => { deptMap[d.name] = d.id; });
    console.log(`✅ ${deptRows.rows.length} departments seeded.`);

    // 3. Hash Passwords
    console.log('[3/4] Creating seed user accounts with bcrypt hashes...');
    const adminPassHash = await bcrypt.hash('Admin@123', 10);
    const doctorPassHash = await bcrypt.hash('Doctor@123', 10);
    const patientPassHash = await bcrypt.hash('Patient@123', 10);

    // Create Admin
    const adminRes = await pool.query(`
      INSERT INTO users (full_name, email, password_hash, role, phone)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id;
    `, ['System Administrator', 'admin@hospital.com', adminPassHash, 'admin', '+1-800-555-0100']);
    const adminId = adminRes.rows[0].id;

    // Create Doctors
    const doctorsData = [
      {
        name: 'Dr. Sarah Jenkins, MD',
        email: 'doctor.sarah@hospital.com',
        phone: '+1-800-555-0101',
        dept: 'Cardiology',
        specialization: 'Interventional Cardiology',
        qualification: 'MD, FACC - Harvard Medical School',
        experience: 14,
        fee: 120.00,
        room: 'Suite 302-A',
        days: JSON.stringify(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']),
        shift_start: '09:00:00',
        shift_end: '16:00:00',
        bio: 'Specialist in coronary artery interventions and preventive cardiovascular health.'
      },
      {
        name: 'Dr. James Wilson, MD',
        email: 'doctor.james@hospital.com',
        phone: '+1-800-555-0102',
        dept: 'Neurology',
        specialization: 'Cognitive & Vascular Neurology',
        qualification: 'MD, PhD - Johns Hopkins University',
        experience: 11,
        fee: 150.00,
        room: 'Suite 405-B',
        days: JSON.stringify(['Monday', 'Wednesday', 'Friday']),
        shift_start: '10:00:00',
        shift_end: '17:00:00',
        bio: 'Expert in cerebrovascular health, stroke management, and chronic migraines.'
      },
      {
        name: 'Dr. Elena Rostova, MD',
        email: 'doctor.elena@hospital.com',
        phone: '+1-800-555-0103',
        dept: 'Pediatrics',
        specialization: 'Pediatric General & Neonatal Care',
        qualification: 'MD, FAAP - Stanford Medicine',
        experience: 9,
        fee: 90.00,
        room: 'Suite 104-C',
        days: JSON.stringify(['Monday', 'Tuesday', 'Thursday', 'Saturday']),
        shift_start: '08:30:00',
        shift_end: '15:30:00',
        bio: 'Passionate pediatrician with special focus on developmental health and adolescent wellness.'
      },
      {
        name: 'Dr. Marcus Sterling, MD',
        email: 'doctor.marcus@hospital.com',
        phone: '+1-800-555-0104',
        dept: 'Orthopedics',
        specialization: 'Joint Reconstruction & Sports Medicine',
        qualification: 'MD, FAAOS - Mayo Clinic',
        experience: 16,
        fee: 135.00,
        room: 'Suite 210-D',
        days: JSON.stringify(['Tuesday', 'Wednesday', 'Thursday', 'Friday']),
        shift_start: '09:30:00',
        shift_end: '16:30:00',
        bio: 'Renowned orthopedic surgeon specializing in minimally invasive arthroscopy.'
      }
    ];

    const doctorIds = [];
    for (const doc of doctorsData) {
      const uRes = await pool.query(`
        INSERT INTO users (full_name, email, password_hash, role, phone)
        VALUES ($1, $2, $3, 'doctor', $4)
        RETURNING id;
      `, [doc.name, doc.email, doctorPassHash, doc.phone]);

      const docId = uRes.rows[0].id;
      doctorIds.push(docId);

      await pool.query(`
        INSERT INTO doctors (id, department_id, specialization, qualification, experience_years, consultation_fee, room_number, available_days, shift_start, shift_end, bio)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11);
      `, [
        docId,
        deptMap[doc.dept],
        doc.specialization,
        doc.qualification,
        doc.experience,
        doc.fee,
        doc.room,
        doc.days,
        doc.shift_start,
        doc.shift_end,
        doc.bio
      ]);
    }
    console.log(`✅ ${doctorsData.length} doctor profiles seeded.`);

    // Create Patients
    const patientsData = [
      {
        name: 'John Doe',
        email: 'john.doe@example.com',
        phone: '+1-555-0199',
        dob: '1988-06-14',
        gender: 'Male',
        bloodGroup: 'O+',
        address: '742 Evergreen Terrace, Springfield',
        emergency: 'Jane Doe (+1-555-0198)',
        history: 'Mild asthma, penicillin allergy.'
      },
      {
        name: 'Emily Smith',
        email: 'emily.smith@example.com',
        phone: '+1-555-0244',
        dob: '1994-09-22',
        gender: 'Female',
        bloodGroup: 'A+',
        address: '123 Blossom Hill Rd, Suite 4B',
        emergency: 'Robert Smith (+1-555-0245)',
        history: 'No chronic conditions reported.'
      }
    ];

    const patientIds = [];
    for (const pat of patientsData) {
      const uRes = await pool.query(`
        INSERT INTO users (full_name, email, password_hash, role, phone)
        VALUES ($1, $2, $3, 'patient', $4)
        RETURNING id;
      `, [pat.name, pat.email, patientPassHash, pat.phone]);

      const patId = uRes.rows[0].id;
      patientIds.push(patId);

      await pool.query(`
        INSERT INTO patients (id, date_of_birth, gender, blood_group, address, emergency_contact, medical_history)
        VALUES ($1, $2, $3, $4, $5, $6, $7);
      `, [patId, pat.dob, pat.gender, pat.bloodGroup, pat.address, pat.emergency, pat.history]);
    }
    console.log(`✅ ${patientsData.length} patient profiles seeded.`);

    // 4. Seed Realistic Appointments (Upcoming & Past Bookings)
    console.log('[4/4] Seeding realistic appointment bookings & prescriptions...');

    // Appointment 1: Upcoming Confirmed (John Doe -> Dr. Sarah Jenkins)
    await pool.query(`
      INSERT INTO appointments (patient_id, doctor_id, department_id, appointment_date, time_slot, status, symptoms)
      VALUES ($1, $2, $3, CURRENT_DATE + INTERVAL '1 day', '10:30 AM', 'confirmed', 'Mild chest tightness and shortness of breath following morning run');
    `, [patientIds[0], doctorIds[0], deptMap['Cardiology']]);

    // Appointment 2: Upcoming Pending (Emily Smith -> Dr. James Wilson)
    await pool.query(`
      INSERT INTO appointments (patient_id, doctor_id, department_id, appointment_date, time_slot, status, symptoms)
      VALUES ($1, $2, $3, CURRENT_DATE + INTERVAL '3 days', '02:00 PM', 'pending', 'Recurring tension headaches and ocular light sensitivity in afternoons');
    `, [patientIds[1], doctorIds[1], deptMap['Neurology']]);

    // Appointment 3: Past Completed with Prescription (John Doe -> Dr. Marcus Sterling)
    const app3Res = await pool.query(`
      INSERT INTO appointments (patient_id, doctor_id, department_id, appointment_date, time_slot, status, symptoms)
      VALUES ($1, $2, $3, CURRENT_DATE - INTERVAL '10 days', '11:00 AM', 'completed', 'Right knee lateral joint stiffness after trail hiking')
      RETURNING id;
    `, [patientIds[0], doctorIds[3], deptMap['Orthopedics']]);

    const app3Id = app3Res.rows[0].id;
    const medicinesJson = JSON.stringify([
      { name: 'Ibuprofen 400mg', dosage: '1 tablet twice daily after meals', duration: '5 days' },
      { name: 'Methylprednisolone Gel', dosage: 'Apply locally over knee joint 3x daily', duration: '7 days' }
    ]);

    await pool.query(`
      INSERT INTO prescriptions (appointment_id, doctor_id, patient_id, diagnosis, medicines, doctor_notes, follow_up_date)
      VALUES ($1, $2, $3, 'Acute Patellofemoral Tendonitis', $4::jsonb, 'Apply cold compression for 15 minutes twice daily. Rest knee from heavy impact. Follow up if swelling persists.', CURRENT_DATE + INTERVAL '14 days');
    `, [app3Id, doctorIds[3], patientIds[0], medicinesJson]);

    // Appointment 4: Past Cancelled (Emily Smith -> Dr. Elena Rostova)
    await pool.query(`
      INSERT INTO appointments (patient_id, doctor_id, department_id, appointment_date, time_slot, status, symptoms, cancellation_reason)
      VALUES ($1, $2, $3, CURRENT_DATE - INTERVAL '14 days', '09:30 AM', 'cancelled', 'Seasonal dry cough and throat irritation', 'Symptoms resolved with home hydration; patient cancelled appointment');
    `, [patientIds[1], doctorIds[2], deptMap['Pediatrics']]);

    console.log('✅ Realistic sample appointments and prescriptions successfully created!');
    console.log('----------------------------------------------------');
    console.log('🚀 DATABASE INITIALIZATION COMPLETE!');
    console.log('----------------------------------------------------');
    console.log('Demo Credentials for Testing:');
    console.log('  👑 Admin:   admin@hospital.com        / Admin@123');
    console.log('  🩺 Doctor:  doctor.sarah@hospital.com / Doctor@123');
    console.log('  🩺 Doctor:  doctor.james@hospital.com / Doctor@123');
    console.log('  🩺 Doctor:  doctor.elena@hospital.com / Doctor@123');
    console.log('  🩺 Doctor:  doctor.marcus@hospital.com/ Doctor@123');
    console.log('  👤 Patient: john.doe@example.com      / Patient@123');
    console.log('  👤 Patient: emily.smith@example.com   / Patient@123');
    console.log('----------------------------------------------------');

  } catch (err) {
    console.error('❌ Error initializing database:', err);
  } finally {
    await pool.end();
  }
}

initializeDatabase();
