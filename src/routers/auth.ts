import express from 'express';
import { ActiveEndpointHandler, MethodNotAllowedHandler } from '../handlers/base-handler';
import registerHandler, { RegisterBodyValidator } from '../handlers/auth/register-handler';
import { AuthorizedHeaderVerification } from '../middleware/header-verification';
import loginHandler, { LoginBodyValidator } from '../handlers/auth/login-handler';
import multer from 'multer';

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/images/users');
  },
  filename: function (req, file, cb) {
    const extArray = file.mimetype.split('/');
    const extension = extArray[extArray.length - 1];
    cb(null, file.fieldname + '-' + Date.now() + '.' + extension);
  },
});

const upload = multer({ storage: storage });

export const AuthRouter = express.Router();

AuthRouter.get('/', ActiveEndpointHandler).all('/', MethodNotAllowedHandler);

AuthRouter.post('/login', LoginBodyValidator, loginHandler).all('/', MethodNotAllowedHandler);

AuthRouter.post(
  '/register',
  upload.single('user_photo'),
  AuthorizedHeaderVerification,
  RegisterBodyValidator,
  registerHandler
).all('/register', MethodNotAllowedHandler);
