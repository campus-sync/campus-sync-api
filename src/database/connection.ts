import { Pool, PoolConfig } from 'pg';
import { MongoClient, ServerApiVersion } from 'mongodb';
import { hashPassword } from '../util/cryptography';

export const config: PoolConfig = {
  user: process.env.DBUSER,
  password: process.env.DBPASSWORD,
  database: process.env.DBNAME,
  host: process.env.DBHOST,
  port: Number(process.env.DBPORT),
};

export const pool = new Pool(config);

const uri = process.env.MONGO_URI;

export const mongoClient = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

// Check if one adming already exists
export const checkAdminExists = async (): Promise<boolean> => {
  try {
    await mongoClient.connect();
    const admin = await mongoClient.db().collection('users').findOne({ accountType: 'admin' });

    return admin ? true : false;
  } catch (error) {
    console.error('Error checking for admin existence:', error);
    return false;
  }
};

export const createAdmin = async () => {
  if (await checkAdminExists()) {
    console.log('Admin already exists');
  } else {
    const defaultAdmin = {
      registrationId: '4VM21IS018',
      name: 'Hitesh',
      phone: 9740490947,
      email: '10hiteshparmar@gmail.com',
      accountType: 'admin',
      password: await hashPassword('admin'),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    try {
      await mongoClient.connect();
      await mongoClient.db().collection('users').insertOne(defaultAdmin);
      console.log('Default admin account created');
    } catch (error) {
      console.error('Error creating default admin account:', error);
    }
  }
};

createAdmin();
