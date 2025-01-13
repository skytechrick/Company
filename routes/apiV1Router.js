import express from 'express';
import authentication from './authenticationRouter.js';
const apiV1Router = express.Router();
export default apiV1Router;

const apiMiddleware = async (req, res, next) => {
    req.isApi = true;
    next();
};

apiV1Router.use('/authentication', apiMiddleware , authentication );