import express from "express";
import morgan from "morgan";
import {
  ActiveEndpointHandler,
  MethodNotAllowedHandler,
} from "./handlers/base-handler";

const app = express();
export default app;

// Base URL where all the logics are handled
const baseURL: string = "/api/v1";

/*
 * Express middlewares to handle the request
 */

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

// Server URL middleware to check server status
app.route("/").get(ActiveEndpointHandler).all(MethodNotAllowedHandler);
