import express from 'express';
const auth = express.Router();
export default auth;

import { signup } from '../controllers/authenticationControllers.js';

auth.post('/signup' , signup );
auth.post('/signup-verify-otp',);
auth.post('/login',);
auth.post('/login-verify-otp',);
auth.post('/forgot-password',);
auth.post('/forgot-password-verify-otp',);
auth.post('/reset-password',);
auth.post('/authenticate',);
auth.post('/logout',);
