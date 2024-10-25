import express from 'express';
import { ActiveEndpointHandler, MethodNotAllowedHandler } from '../handlers/base-handler';
import refreshHandler, { RefreshBodyValidator } from '../handlers/user/refresh-handler';
import { AuthorizedHeaderVerification, RefreshHeaderVerification } from '../middleware/header-verification';

const UserRouter = express.Router();
export default UserRouter;

UserRouter.get('/', ActiveEndpointHandler).all('/', MethodNotAllowedHandler);

UserRouter.post('/refresh', RefreshHeaderVerification, RefreshBodyValidator, refreshHandler).all(
  '/',
  MethodNotAllowedHandler
);

UserRouter.use('/', AuthorizedHeaderVerification);
