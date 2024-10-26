import { isEmail, isStrongPassword } from 'validator';
import { RegisterReqBody } from '../../../types/auth';
import { AppError, catchAsync } from '../../middleware/error-middleware';
import { Request, Response, NextFunction } from 'express';
import User from '../../database/models/user-modal';
import { GenericAPIBody, GenericAPIResponse, GenericReqHeaders } from '../../../types/global';

export default catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { registration_id, name, description, email, phone, password, account_type } = req.body as RegisterReqBody;
  const { 'x-account-type': reqAccountType } = req.headers as unknown as GenericReqHeaders;

  // if (account_type === 'institution_spoc') {
  //   if (reqAccountType !== 'admin') {
  //     return next(new AppError('Only admin can create an institution spoc account', 'INVALID_PARAMETERS', 400));
  //   }
  // } else if (account_type === 'department_spoc') {
  //   if (reqAccountType !== 'institution_spoc') {
  //     return next(
  //       new AppError('Only institution spoc can create a department spoc account', 'INVALID_PARAMETERS', 400)
  //     );
  //   }
  // } else if (account_type === 'vendor') {
  //   if (reqAccountType !== 'institution_spoc') {
  //     return next(new AppError('Only institution spoc can create a vendor account', 'INVALID_PARAMETERS', 400));
  //   }
  // } else if (account_type === 'teacher') {
  //   if (reqAccountType !== 'department_spoc') {
  //     return next(new AppError('Only department spoc can create a teacher account', 'INVALID_PARAMETERS', 400));
  //   }
  // } else if (account_type === 'student') {
  //   if (reqAccountType !== 'institution_spoc') {
  //     return next(new AppError('Only institution spoc can create a student account', 'INVALID_PARAMETERS', 400));
  //   }
  // } else if (account_type === 'admin') {
  //   if (reqAccountType !== 'admin') {
  //     return next(new AppError('Only admin can create an admin account', 'INVALID_PARAMETERS', 400));
  //   }
  // }

  const existingUser = await User.getByPhone(Number(phone));
  if (existingUser) {
    return next(new AppError('User already exists', 'INVALID_PARAMETERS', 400));
  }

  const baseURL = process.env.image_base_URL;
  const photo = req.file ? `${baseURL}/users/${req.file.filename}` : `${baseURL}/placeholder.png`;

  const user = new User(registration_id, name, Number(phone), password, account_type, email, photo, description);
  await user.save();

  const response: GenericAPIResponse<GenericAPIBody> = {
    success: true,
    code: 201,
    data: {
      message: 'Account created successfully',
    },
  };

  return res.status(201).json(response);
});

export const RegisterBodyValidator = (req: Request, res: Response, next: NextFunction) => {
  const { registration_id, name, email, phone, password, account_type } = req.body as RegisterReqBody;

  const missing: string[] = [];

  if (!registration_id) missing.push('registration_id');
  if (!name) missing.push('name');
  if (!phone) missing.push('phone');
  if (!password) missing.push('password');
  if (!account_type) missing.push('account_type');

  if (missing.length > 0) {
    return next(new Error(`Missing required fields! - ${missing.join(', ')}`));
  }

  const errors: string[] = [];

  if (email) {
    if (!isEmail(email)) errors.push('email');
  }

  if (phone.toString().length > 10 || phone.toString().length < 10) {
    errors.push('phone must be 10 digits');
  }

  if (!isStrongPassword(password)) {
    errors.push('password must be strong');
  }

  if (
    ['user', 'student', 'teacher', 'vendor', 'department_spoc', 'institution_spoc'].findIndex(
      (type) => type === account_type
    ) === -1
  ) {
    errors.push('Invalid account type!');
  }

  if (errors.length > 0) {
    return next(new Error(`Invalid fields! - ${errors.join(', ')}`));
  }

  next();
};
