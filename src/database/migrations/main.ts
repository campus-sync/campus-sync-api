import dotenv from 'dotenv';
dotenv.config({ path: `${process.cwd()}\\.env` });

import { Client } from 'pg';
import { config } from '../connection';
import { UsersMigration } from './users-migration';
import canteenMigrations from './canteen-migrations';

export const runMigrations = async () => {
  const startTime: number = Date.now();

  console.error(`Migrating ${config.database}....`);

  // TRY TO CREATE DATABASE USING THE INBUILT POSTGRES DATABASE
  const client = new Client(config);
  const tempClient = new Client({ ...config, database: 'postgres' });

  try {
    try {
      await tempClient.connect();
      await tempClient.query(`CREATE DATABASE ${config.database}`);

      console.log('Database initialized!\n');
    } catch (e) {
      console.log('\x1b[31mError: ', (e as unknown as Error).message, '\x1b[0m');
      console.log('Aborting Migrations...\n');
      await client.end();

      return;
    } finally {
      await tempClient.end();
    }

    // IF CREATE DATABASE WAS SUCCESSFUL, START USING OUR DATABASE AND GENERATE TABLES

    await client.connect();

    await UsersMigration(client);
    await canteenMigrations(client);

    console.log('\nTIME TAKEN TO MIGRATE:', Date.now() - startTime, 'ms');
  } catch (e) {
    console.log('\x1b[31mError: ', (e as unknown as Error).message, '\x1b[0m');
    console.log('Aborting Migrations...\n');
    return;
  } finally {
    await client.end();
  }
};
