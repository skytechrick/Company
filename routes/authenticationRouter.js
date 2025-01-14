import express from 'express';
const auth = express.Router();
export default auth;

import { signup , signupVerifyOtp , login , loginVerifyOtp } from '../controllers/authenticationControllers.js';

auth.post('/signup' , signup );
auth.post('/signup-verify-otp' , signupVerifyOtp );
auth.post('/login' , login );
auth.post('/login-verify-otp' , loginVerifyOtp );
auth.post('/forgot-password',);
auth.post('/forgot-password-verify-otp',);
auth.post('/reset-password',);
auth.post('/authenticate',);
auth.post('/logout',);
