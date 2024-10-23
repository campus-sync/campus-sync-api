import { Client } from 'pg';

export const UsersMigration = async (client: Client) => {
  console.log('Creating users table...');
  return client.query(`
        CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            registration_id VARCHAR(100) DEFAULT NULL,
            
            name VARCHAR(20) NOT NULL,
            phone INTEGER NOT NULL,
            email VARCHAR(100) DEFAULT NULL,
            password VARCHAR(100) NOT NULL,
            photo VARCHAR(100) DEFAULT NULL,

            account_type VARCHAR(10) NOT NULL DEFAULT 'student' CHECK(account_type IN ('student', 'teacher', 'vendor', 'department_spoc', 'institution_spoc', 'admin')),

            created_at TIMESTAMP NOT NULL DEFAULT NOW(),
            deleted_at TIMESTAMP DEFAULT NULL,
            updated_at TIMESTAMP NOT NULL DEFAULT NOW()
        );
    `);
};
