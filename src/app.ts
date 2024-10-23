import express from 'express';
import morgan from 'morgan';
import { ActiveEndpointHandler, InvalidEndpointHandler, MethodNotAllowedHandler } from './handlers/base-handler';
import { AccessVerification } from './middleware/access-verification';
import { GenericHeaderVerification } from './middleware/header-verification';
import errorMiddleware from './middleware/error-middleware';

const app = express();
export default app;

// Base URL where all the logics are handled
const baseURL: string = '/api/v1';

/*
 * Express middlewares to handle the request
 */

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Server URL middleware to check server status
app.route('/').get(ActiveEndpointHandler).all(MethodNotAllowedHandler);

// BASE URL and to verify if the request has access using the access key
app.use(AccessVerification, GenericHeaderVerification);
app.route(baseURL).get(ActiveEndpointHandler).all(MethodNotAllowedHandler);

/*
 * Importing all the individual routers
 */

/*
 * Handle Invalid Endpoints - return 404
 */

app.route('*').all(InvalidEndpointHandler);
app.use(errorMiddleware);
