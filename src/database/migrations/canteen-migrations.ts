import { Client } from 'pg';

export default async (client: Client) => {
  await canteenItemsMigration(client);
};

const canteenItemsMigration = async (client: Client) => {
  console.log('Creating canteen_items table...');
  await client.query(`
        CREATE TABLE IF NOT EXISTS canteen_items (
            id SERIAL PRIMARY KEY,

            type VARCHAR(100) NOT NULL CHECK(type IN ('breakfast', 'lunch', 'snacks')),
            name VARCHAR(100) NOT NULL,
            description VARCHAR(500) NOT NULL,
            price BIGINT NOT NULL,

            created_at TIMESTAMP NOT NULL DEFAULT NOW(),
            updated_at TIMESTAMP NOT NULL DEFAULT NOW()
        );
    `);
};
