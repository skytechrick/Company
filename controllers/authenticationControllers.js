import dotenv from "dotenv";
import admin from "../utils/googleConfig.js";
import { signupSchema , loginSchema }  from "../utils/zodSchema.js";
import { hashPassword , comparePassword } from "../utils/passwordController.js";
import { generateToken , verifyToken } from "../utils/jwtController.js";
import Modules from "../modules.js";
import crypto from "crypto";
import { sendMail } from "../utils/sendMail.js";

dotenv.config();

export const signup = async ( req , res , next ) => {
    try {
        
        const body = signupSchema.safeParse(req.body);
        if(!body.success) {
            return res.status(400).json({ message: "Unauthorized access" });
        };

        const { email , password , firstName , lastName , mobileNumber } = body.data;

        const isUser = await Modules.user.findOne({email});

        if(isUser) {
            return res.status(302).json({
                message: "User already exists",
                redirect: "/api/v1/authentication/login",
                redirectMessage: "Login page",
            });
        };

        const hashedPassword = await hashPassword(password);

        const otp = crypto.randomInt(100000, 999999);
        const otpExpiry = Date.now() + 600000;
        const token = crypto.randomBytes(89).toString('hex');

        const newUserObject = {
            email: email.toLowerCase(),
            personalInfo: {
                firstName,
                lastName,
                mobileNumber,
            },
            password: hashedPassword,
            authentication: {
                otp,
                otpExpiry,
                token,
            },
        };
        const isMailSent = await sendMail({
            from:`No-reply <${process.env.MAIL_ID}>`,
            to: email.toLowerCase(),
            subject: "Congratulation your account has been created, verify your email address",
            html: `<h1>Your OTP is ${otp}</h1>`,
        });
        if(!isMailSent) {
            return res.status(400).json({ message: "Unable to send OTP" });
        };

        const newUser = await Modules.user(newUserObject);

        const jwtToken = generateToken({
            id: newUser._id,
            token: newUser.authentication.token,
            createdAt: Date.now(),
        });

        await newUser.save().then( response =>{
            return res.status(201).json({ otpToken: jwtToken , message: "Account created successfully, please verify your email address." });
        }).catch((error)=>{
            return res.status(500).json({ message: "Internal server error, unable to create account." });
        });

    } catch (error) {
        next(error);   
    };
};

export const signupVerifyOtp = async ( req , res , next ) => {
    try {
        const otpToken = req.headers.otptoken;
        const gotJwtToken = otpToken.split("Bearer ")[1];
        if(!gotJwtToken) {
            return res.status(400).json({ message: "Unauthorized access." });
        };
        const decodedToken = verifyToken(gotJwtToken);
        const otp = parseInt(req.body.otp,10);
        const user = await Modules.user.findOne({ _id: decodedToken.id });
        if(!user) {
            return res.status(404).json({ message: "User not found." });
        };

        if(user.isBan) {
            return res.status(401).json({ message: "Account is banned." });
        };

        if(decodedToken.token !== user.authentication.token) {
            return res.status(401).json({ message: "Unauthorized access." });
        };

        if(user.authentication.otpExpiry < Date.now()) {
            return res.status(401).json({ message: "OTP expired." });
        };

        if(user.authentication.otp !== otp) {
            return res.status(401).json({ message: "Invalid OTP." });
        };
        const newToken = crypto.randomBytes(89).toString('hex');
        
        user.authentication.otp = null;
        user.authentication.otpExpiry = null;
        user.authentication.token = null;
        user.isVerified = true;
        user.loggedIn.token = newToken;
        user.loggedIn.lastLoggedIn = new Date();
        user.loggedIn.loginAttempts = 0;

        const jwtToken = generateToken({
            id: user._id,
            token: newToken,
            createdAt: Date.now(),
        });

        await user.save().then( response =>{
            return res.status(200).json({ token: jwtToken, message: "Account verified successfully." });
        }).catch((error)=>{
            return res.status(500).json({ message: "Internal server error, unable to verify account." });
        });

    } catch (error) {
        next(error);
    };
};

export const login = async ( req , res , next ) => {
    try {
        const body = loginSchema.safeParse(req.body);
        if(!body.success) {
            return res.status(400).json({ message: "Unauthorized access" });
        };
        
        const { email , password } = body.data;
        const user = await Modules.user.findOne({email});
        if(!user) {
            return res.status(404).json({ message: "You don't have an account." });
        };
        const isPasswordValid = await comparePassword(password , user.password);
        if(!isPasswordValid) {
            return res.status(401).json({ message: "Incorrect password." });
        };

        const otp = crypto.randomInt(100000, 999999);
        const otpExpiry = Date.now() + 600000;
        const token = crypto.randomBytes(89).toString('hex');

        const isMailSent = await sendMail({
            from:`No-reply <${process.env.MAIL_ID}>`,
            to: email.toLowerCase(),
            subject: "Login OTP",
            html: `<h1>Your OTP is ${otp}</h1>`,
        });

        if(!isMailSent) {
            return res.status(400).json({ message: "Unable to send OTP" });
        };

        user.authentication.otp = otp;
        user.authentication.otpExpiry = otpExpiry;
        user.authentication.token = token;

        await user.save().then( response =>{
            return res.status(200).json({ otpToken: token , message: "OTP sent to your email address." });
        }).catch((error)=>{
            return res.status(500).json({ message: "Internal server error, unable to send OTP." });
        });

    } catch (error) {
        next(error);   
    };
};

export const authentication = async ( req , res , next ) => {
    const token = req.body.token;
    if (!token) {
        return res.status(401).send({ message: 'Authentication failed' });
    };    
    try {
        const decodedToken = await admin.auth().verifyIdToken(token);
        res.status(200).send({ message: 'User authenticated', user: decodedToken });
    } catch (error) {
        
        res.status(401).send({ message: 'Authentication failed' });
    };
};