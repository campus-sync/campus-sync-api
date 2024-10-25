import { sign } from 'jsonwebtoken';
import { TokenPayload } from '../../../types/jwt';
import { pool } from '../connection';
import { AppError } from '../../middleware/error-middleware';
import { UserDbBody } from '../../../types/auth';
import { compareSync } from 'bcrypt';
import { AccountTypes } from '../../../types/global';
import { hashPassword } from '../../util/cryptography';

export default class User {
  private _id?: number;
  registrationId: string;

  name: string;
  phone: number;
  email?: string;
  password: string;
  photo?: string;

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
    updatedAt?: Date,
    deletedAt?: Date,
    createdAt?: Date,
    id?: number
  ) {
    this.registrationId = registrationId;
    this.name = name;
    this.phone = phone;
    this.password = password;
    this.accountType = accountType;

    if (email) this.email = email;
    if (photo) this.photo = photo;

    this.updatedAt = updatedAt ? updatedAt : new Date();
    this.createdAt = createdAt ? createdAt : new Date();
    if (deletedAt) this.deletedAt = deletedAt;

    if (id) this._id = id;
  }

  async save(): Promise<number> {
    const hashed = await hashPassword(this.password);

    const data: { id: number } = (
      await pool.query(
        'INSERT INTO users(registration_id, name, phone, email, password, photo, account_type, created_at, updated_at) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id',
        [
          this.registrationId,
          this.name,
          this.phone,
          this.email,
          hashed,
          this.photo,
          this.accountType,
          this.createdAt,
          this.updatedAt,
        ]
      )
    ).rows[0];
    this._id = data.id;
    return data.id;
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
    const data = await pool.query('UPDATE users SET deleted_at = $1 WHERE id = $2', [new Date(), this.id]);
    if (data.rowCount === 0) return false;

    return true;
  }

  /*
   * Update the user in the database
   */

  async update(target: string, value: string): Promise<boolean> {
    if (target === 'email') {
      // Check if email already linked
      const data = await pool.query('SELECT * FROM users WHERE email = $1', [value]);
      if (data?.rowCount && data?.rowCount > 0) throw new AppError('Email already in use', 'INVALID_PARAMETERS', 400);
    }

    if (target === 'phone') {
      // Check if phone already linked
      const data = await pool.query('SELECT * FROM users WHERE phone = $1', [value]);
      if (data?.rowCount && data?.rowCount > 0) throw new AppError('Phone already in use', 'INVALID_PARAMETERS', 400);
    }

    if (target === 'registration_id') {
      // Check if registration_id already linked
      const data = await pool.query('SELECT * FROM users WHERE registration_id = $1', [value]);

      if (data?.rowCount && data?.rowCount > 0)
        throw new AppError('Registration ID already in use', 'INVALID_PARAMETERS', 400);
    }

    const data = await pool.query(`UPDATE users SET ${target} = $1, updated_at = $2 WHERE id = $3`, [
      value,
      new Date(),
      this.id,
    ]);

    if (data.rowCount === 0) return false;
    return true;
  }

  /*
   * Recover the user
   */

  async recover(): Promise<boolean> {
    if (!this.deletedAt) return false;

    const data = await pool.query('UPDATE users SET deleted_at = $1 WHERE id = $2', [null, this.id]);
    if (data.rowCount === 0) return false;
    return true;
  }

  /*
   * Get the user from the database by id
   */

  static async getById(getId: number): Promise<User | undefined> {
    const data = await pool.query('SELECT * FROM users WHERE id = $1', [getId]);

    if (data.rowCount === 0) return undefined;
    const {
      registration_id: registrationId,
      name,
      phone,
      email,
      password,
      photo,
      account_type: accountType,
      id,
      deleted_at: deletedAt,
      updated_at: updatedAt,
      created_at: createdAt,
    }: UserDbBody = data.rows[0];

    return new User(
      registrationId,
      name,
      phone,
      password,
      accountType,
      email,
      photo,
      updatedAt,
      deletedAt,
      createdAt,
      id
    );
  }

  /*
   * Get the user from the database by phone
   */

  static async getByPhone(getPhone: number): Promise<User | undefined> {
    const data = await pool.query('SELECT * FROM users WHERE phone = $1', [getPhone]);
    if (data.rowCount === 0) return undefined;

    const {
      registration_id: registrationId,
      name,
      phone,
      email,
      password,
      photo,
      account_type: accountType,
      id,
      deleted_at: deletedAt,
      updated_at: updatedAt,
      created_at: createdAt,
    }: UserDbBody = data.rows[0];

    return new User(
      registrationId,
      name,
      phone,
      password,
      accountType,
      email,
      photo,
      updatedAt,
      deletedAt,
      createdAt,
      id
    );
  }
}
