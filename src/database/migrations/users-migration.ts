import { Client } from 'pg';
import { hashPassword } from '../../util/cryptography';

export const UsersMigration = async (client: Client) => {
  console.log('Creating users table...');
  await client.query(`
        CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            registration_id VARCHAR(100) DEFAULT NULL,
            
            name VARCHAR(50) NOT NULL,
            phone BIGINT UNIQUE NOT NULL,
            email VARCHAR(100) UNIQUE DEFAULT NULL,
            password VARCHAR(100) NOT NULL,
            photo VARCHAR(100) DEFAULT NULL,

            account_type VARCHAR(20) NOT NULL DEFAULT 'student' CHECK(account_type IN ('student', 'teacher', 'vendor', 'department_spoc', 'institution_spoc', 'admin')),

            created_at TIMESTAMP NOT NULL DEFAULT NOW(),
            deleted_at TIMESTAMP DEFAULT NULL,
            updated_at TIMESTAMP NOT NULL DEFAULT NOW()
        );
    `);

  console.log('Inserting main admin by default...');

  const hashedPassword = await hashPassword('admin');

  return await client.query(
    `
        INSERT INTO users (name, phone, email, password, account_type) VALUES ('Admin', 9740490947, '10hiteshparmar@gmail.com', $1, 'admin')    
    `,
    [hashedPassword]
  );
};
