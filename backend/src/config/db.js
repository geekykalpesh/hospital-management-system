import dns from 'dns';
import pkg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pkg;

// Custom DNS lookup to ensure flawless resolution for cloud DBs (Neon/AWS) on all OS environments
const customLookup = (hostname, options, callback) => {
  dns.lookup(hostname, { all: false }, callback);
};

const poolConfig = process.env.DATABASE_URL
  ? {
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false,
      },
      lookup: customLookup,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    }
  : {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432', 10),
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_NAME || 'hospital_management_db',
      lookup: customLookup,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    };

const pool = new Pool(poolConfig);

pool.on('error', (err) => {
  console.error('[PostgreSQL] Unexpected idle client error:', err.message);
});

export const query = (text, params) => pool.query(text, params);

export default pool;
