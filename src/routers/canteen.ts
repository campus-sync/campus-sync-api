import express from 'express';
import { ActiveEndpointHandler, MethodNotAllowedHandler } from '../handlers/base-handler';
import listCanteenItemsHandler from '../handlers/canteen/list-canteen-item-handler';
import updateCanteenItemHandler, {
  updateCanteenItemBodyValidator,
} from '../handlers/canteen/update-canteen-item-handler';

const CanteenRouter = express.Router();
export default CanteenRouter;

CanteenRouter.get('/', ActiveEndpointHandler).all('/', MethodNotAllowedHandler);

CanteenRouter.get('/items', listCanteenItemsHandler).all('/items', MethodNotAllowedHandler);

CanteenRouter.patch('/items', updateCanteenItemBodyValidator, updateCanteenItemHandler).all(
  '/items',
  MethodNotAllowedHandler
);
