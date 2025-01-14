import express from 'express';
import authentication from './authenticationRouter.js';
import { authenticationApiLimiter } from '../utils/expressLimiterRate.js';
const apiV1Router = express.Router();
export default apiV1Router;

const apiMiddleware = async (req, res, next) => {
    req.isApi = true;
    next();
};

apiV1Router.use('/authentication', apiMiddleware, authenticationApiLimiter , authentication );