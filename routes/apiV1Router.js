import express from 'express';
import authentication from './authenticationRouter.js';
const apiV1Router = express.Router();
export default apiV1Router;



apiV1Router.use('/authentication', authentication );