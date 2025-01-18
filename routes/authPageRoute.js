import dotenv from 'dotenv';
import express from 'express';
const auth = express.Router();
export default auth;

import { authentication , resetPassword } from '../controllers/authPageControllers.js';


auth.get('/authentication' , authentication );
auth.get('/reset-password', resetPassword );