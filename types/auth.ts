/*
 * Database Body
 */

import { AccountTypes, GenericAPIBody } from './global';

export interface UserDbBody {
  id: string;
  registration_id: string;
  name: string;
  phone: number;
  email: string;
  password: string;
  photo: string;
  account_type: AccountTypes;
  created_at: Date;
  deleted_at: Date;
  updated_at: Date;
}

/*
 * Request Body
 */

export interface LoginReqBody {
  phone: number;
  password: string;
}

export interface RegisterReqBody {
  registration_id: string;

  name: string;
  phone: number;
  email?: string;
  account_type?: AccountTypes;

  password: string;
}

/*
 * Response Body
 */

export interface AbstractedUser {
  id: string;
  registration_id: string;
  name: string;
  phone: number;
  email: string;
  photo: string;
  account_type: AccountTypes;
}

export interface LoginResBody extends GenericAPIBody {
  user: AbstractedUser;
  access_token: string;
  refresh_token: string;
}
