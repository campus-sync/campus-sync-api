/*
 * Database Body
 */

export interface UserDbBody {
  id: number;
  registration_id: string;
  name: string;
  phone: number;
  email: string;
  password: string;
  photo: string;
  account_type: string;
  created_at: Date;
  deleted_at: Date;
  updated_at: Date;
}

/*
 * Request Body
 */

/*
 * Response Body
 */
