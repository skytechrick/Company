import express from 'express';
const auth = express.Router();
export default auth;
import { signup , signupVerifyOtp , login , loginVerifyOtp , authenticate , forgotPassword , resetPassword , resendOtp } from '../controllers/authenticationControllers.js';

auth.post('/signup' , signup );
auth.post('/signup-verify-otp' , signupVerifyOtp );
auth.post('/login' , login );
auth.post('/login-verify-otp' , loginVerifyOtp );
auth.post('/resend-otp' , resendOtp );
auth.post('/forgot-password' , forgotPassword);
auth.post('/reset-password' , resetPassword);
auth.post('/authenticate' , authenticate);
