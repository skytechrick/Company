import express from 'express';
const auth = express.Router();
export default auth;

import { signup , signupVerifyOtp , login , loginVerifyOtp , authenticate , forgotPassword } from '../controllers/authenticationControllers.js';

auth.post('/signup' , signup );
auth.post('/signup-verify-otp' , signupVerifyOtp );
auth.post('/login' , login );
auth.post('/login-verify-otp' , loginVerifyOtp );
auth.post('/forgot-password' , forgotPassword);
auth.post('/reset-password',);
auth.post('/authenticate' , authenticate);
auth.post('/logout',);
