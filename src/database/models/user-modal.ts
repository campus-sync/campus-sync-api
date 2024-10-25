import { sign } from 'jsonwebtoken';
import { TokenPayload } from '../../../types/jwt';
import { mongoClient } from '../connection';
import { AppError } from '../../middleware/error-middleware';
import { compareSync } from 'bcrypt';
import { AccountTypes } from '../../../types/global';
import { hashPassword } from '../../util/cryptography';
import { ObjectId } from 'mongodb';

export default class User {
  private _id?: string;
  registrationId: string;

  name: string;
  phone: number;
  email?: string;
  password: string;
  photo?: string;
  description?: string;

  accountType: AccountTypes;
  createdAt: Date;
  deletedAt?: Date;
  updatedAt: Date;

  get id() {
    return this._id;
  }

  constructor(
    registrationId: string,
    name: string,
    phone: number,
    password: string,
    accountType: AccountTypes,
    email?: string,
    photo?: string,
    description?: string,
    updatedAt?: Date,
    deletedAt?: Date,
    createdAt?: Date,
    id?: string
  ) {
    this.registrationId = registrationId;
    this.name = name;
    this.phone = phone;
    this.password = password;
    this.accountType = accountType;

    if (email) this.email = email;
    if (photo) this.photo = photo;
    if (description) this.description = description;

    this.updatedAt = updatedAt ? updatedAt : new Date();
    this.createdAt = createdAt ? createdAt : new Date();
    if (deletedAt) this.deletedAt = deletedAt;

    if (id) this._id = id;
  }

  async save(): Promise<string> {
    const hashed = await hashPassword(this.password);

    const result = await mongoClient.db().collection('users').insertOne({
      registrationId: this.registrationId,
      name: this.name,
      phone: this.phone,
      email: this.email,
      password: hashed,
      photo: this.photo,
      description: this.description,
      accountType: this.accountType,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    });

    this._id = result.insertedId.toString();
    return result.insertedId.toString();
  }

  async checkPassword(password: string): Promise<boolean> {
    return compareSync(password, this.password);
  }

  /*
   * Generate access and refresh tokens
   */

  async generateToken(type: 'access' | 'refresh' | 'recover'): Promise<string | undefined> {
    const secret = process.env.JWT_SECRET;
    const accessExpiresIn = process.env.JWT_EXPIRY_ACCESS;
    const refreshExpiresIn = process.env.JWT_EXPIRY_REFRESH;
    const recoverExpiresIn = process.env.JWT_EXPIRY_RECOVER;

    const payload: TokenPayload = {
      phone: this.phone.toString(),
      type,
    };

    if (!secret) return undefined;

    const expiresIn = type === 'access' ? accessExpiresIn : type === 'refresh' ? refreshExpiresIn : recoverExpiresIn;
    if (!expiresIn) return undefined;

    const token = sign(payload, secret, {
      expiresIn,
    });
    return `Bearer ${token}`;
  }

  /*
   * Soft delete the user
   */

  async delete(): Promise<boolean> {
    const result = await mongoClient
      .db()
      .collection('users')
      .updateOne({ _id: new ObjectId(this._id) }, { $set: { deletedAt: new Date() } });

    return result.modifiedCount > 0;
  }

  /*
   * Update the user in the database
   */

  async update(target: string, value: string): Promise<boolean> {
    if (target === 'email') {
      // Check if email already linked
      const data = await mongoClient.db().collection('users').findOne({ email: value });
      if (data) throw new AppError('Email already in use', 'INVALID_PARAMETERS', 400);
    }

    if (target === 'phone') {
      // Check if phone already linked
      const data = await mongoClient.db().collection('users').findOne({ phone: value });
      if (data) throw new AppError('Phone already in use', 'INVALID_PARAMETERS', 400);
    }

    if (target === 'registration_id') {
      // Check if registration_id already linked
      const data = await mongoClient.db().collection('users').findOne({ registrationId: value });
      if (data) throw new AppError('Registration ID already in use', 'INVALID_PARAMETERS', 400);
    }

    const result = await mongoClient
      .db()
      .collection('users')
      .updateOne({ _id: new ObjectId(this._id) }, { $set: { [target]: value, updatedAt: new Date() } });

    return result.modifiedCount > 0;
  }

  /*
   * Recover the user
   */

  async recover(): Promise<boolean> {
    if (!this.deletedAt) return false;

    const result = await mongoClient
      .db()
      .collection('users')
      .updateOne({ _id: new ObjectId(this._id) }, { $set: { deletedAt: null } });

    return result.modifiedCount > 0;
  }

  /*
   * Get the user from the database by id
   */

  static async getById(getId: string): Promise<User | undefined> {
    const data = await mongoClient
      .db()
      .collection('users')
      .findOne({ _id: new ObjectId(getId) });

    if (!data) return undefined;

    const {
      registrationId,
      name,
      phone,
      email,
      password,
      photo,
      description,
      accountType,
      _id,
      deletedAt,
      updatedAt,
      createdAt,
    } = data;

    return new User(
      registrationId,
      name,
      phone,
      password,
      accountType,
      email,
      photo,
      description,
      updatedAt,
      deletedAt,
      createdAt,
      _id.toString()
    );
  }

  /*
   * Get the user from the database by phone
   */

  static async getByPhone(getPhone: number): Promise<User | undefined> {
    const data = await mongoClient.db().collection('users').findOne({ phone: getPhone });

    if (!data) return undefined;

    const {
      registrationId,
      name,
      phone,
      email,
      password,
      photo,
      description,
      accountType,
      _id,
      deletedAt,
      updatedAt,
      createdAt,
    } = data;

    return new User(
      registrationId,
      name,
      phone,
      password,
      accountType,
      email,
      photo,
      description,
      updatedAt,
      deletedAt,
      createdAt,
      _id.toString()
    );
  }
}
