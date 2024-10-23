import { Pool, PoolConfig } from "pg";

export const config: PoolConfig = {
  user: process.env.DBUSER,
  password: process.env.DBPASSWORD,
  database: process.env.DBNAME,
  host: process.env.DBHOST,
  port: Number(process.env.DBPORT),
};

export const pool = new Pool(config);
