import dotenv from "dotenv";
import admin from "../utils/googleConfig.js";
import { signupSchema , loginSchema , emailSchema }  from "../utils/zodSchema.js";
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
        if(!decodedToken) {
            return res.status(400).json({ message: "Unauthorized access." });
        }
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
            user.loggedIn.loginAttempts += 1;
            await user.save();
            return res.status(401).json({ message: "Incorrect password." });
        };

        if(user.loggedIn.loginAttempts >= 5 || user.isVerified === false) {
            
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
            user.isVerified = false;
            user.loggedIn.loginAttempts = 0;
            const jwtToken = generateToken({
                id: user._id,
                token: token,
                createdAt: Date.now(),
            });

            await user.save();
            return res.status(201).json({ otpToken: jwtToken , message: "OTP sent to your email address." });
        };
        
        const newToken = crypto.randomBytes(89).toString('hex');
        user.loggedIn.token = newToken;
        user.loggedIn.lastLoggedIn = new Date();
        user.loggedIn.loginAttempts = 0;

        const jwtToken = generateToken({
            id: user._id,
            token: newToken,
            createdAt: Date.now(),
        });

        await user.save().then( response =>{
            return res.status(200).json({ token: jwtToken , message: "Login successful." });
        }).catch((error)=>{
            return res.status(500).json({ message: "Internal server error, unable to login." });
        });

    } catch (error) {
        next(error);   
    };
};

export const loginVerifyOtp = async ( req , res , next ) => {
    try {
        
        const otpToken = req.headers.otptoken;
        const gotJwtToken = otpToken.split("Bearer ")[1];
        if(!gotJwtToken) {
            return res.status(400).json({ message: "Unauthorized access." });
        };
        const decodedToken = verifyToken(gotJwtToken);
        if(!decodedToken) {
            return res.status(400).json({ message: "Unauthorized access." });
        }
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
            return res.status(200).json({ token: jwtToken, message: "Login successfully." });
        }).catch((error)=>{
            return res.status(500).json({ message: "Internal server error, unable to login." });
        });
    } catch (error) {
        next(error);
    };
};

export const authenticate = async ( req , res , next ) => {
    const token = req.body.token;
    if (!token) {
        return res.status(401).send({ message: 'Authentication failed' });
    };
    try {
        let decodedToken;
        try {
            decodedToken = await admin.auth().verifyIdToken(token);
        } catch (error) {
            return res.status(401).send({ message: 'Authentication failed' });
        };

        let user = await Modules.user.findOne({ email: decodedToken.email });
        
        const newToken = crypto.randomBytes(89).toString('hex');

        if (!user) {
            const newUserObject = {
                email: decodedToken.email,
                personalInfo: {
                    firstName: decodedToken.name,
                },
                isVerified: true,
                loggedIn: {
                    token: newToken,
                    lastLoggedIn: new Date(),
                    loginAttempts: 0,
                },
            };
            const userNew = await Modules.user(newUserObject);
            user = await userNew.save();
        }else{
            user.loggedIn.token = newToken;
            user.loggedIn.lastLoggedIn = new Date();
            user.loggedIn.loginAttempts = 0;
            await user.save();
        };
        const jwtToken = generateToken({
            id: user._id,
            token: newToken,
            createdAt: Date.now(),
        });

        return res.status(200).json({ token: jwtToken, message: "Login successfully." });

    } catch (error) {
        next(error);
    };
};

export const forgotPassword = async ( req , res , next ) => {
    try {
        const body = emailSchema.safeParse(req.body);
        if(!body.success) {
            return res.status(400).json({ message: "Unauthorized access" });
        };
        const { email } = body.data;
        const user = await Modules.user.findOne({ email });
        if(!user) {
            return res.status(404).json({ message: "User not found." });
        };  
        const token = crypto.randomBytes(59).toString('hex');
        const isMailSent = await sendMail({
            from: `No-reply <${process.env.MAIL_ID}>`,
            to: user.email.toLowerCase(),
            subject: "Forgot password reset link",
            html: `<h1>Reset link</h1>
            <a href="http://localhost/authentication/reset-password?t=${encodeURIComponent(token)}&email=${encodeURIComponent(user.email)}">Reset password</a>
            <h5>http://localhost/authentication/reset-password?t=${encodeURIComponent(token)}&email=${encodeURIComponent(user.email)}</h5>
            <h5>Link expires in 5 minutes</h5>
            `,
        });
        
        user.authentication.token = token;
        user.authentication.tokenExpiry = Date.now() + 300000;
        user.authentication.otp = 1111111;
        await user.save();

        if(!isMailSent) {
            return res.status(400).json({ message: "Unable to send OTP" });
        };

        return res.status(200).json({ message: "Reset password link sent to your email address." });

    } catch (error) {
        next(error);
    };
};

export const resetPassword = async ( req , res , next ) => {
    try {
        const { email , token , password } = req.body;
        const user = await Modules.user.findOne({ email });
        if(!user) {
            return res.status(404).json({ message: "User not found." });
        };
        if(user.authentication.token !== token) {
            return res.status(401).json({ message: "Unauthorized access." });
        };
        if(user.authentication.tokenExpiry < Date.now()) {
            return res.status(401).json({ message: "Link expired." });
        };
        if(user.authentication.otp !== 1111111) {
            return res.status(401).json({ message: "Unauthorized access." });
        };
        const hashedPassword = await hashPassword(password);
        user.password = hashedPassword;
        user.authentication.token = null;
        user.authentication.tokenExpiry = null;
        user.authentication.otp = null;
        await user.save();
        return res.status(200).json({ message: "Password reset successfully." });
    } catch (error) {
        next(error);
    };
};

export const resendOtp = async ( req , res , next ) => {
    try {
        const { email } = req.body;
        const user = await Modules.user.findOne({ email });
        if(!user) {
            return res.status(404).json({ message: "User not found." });
        };
        if(user.authentication.otpExpiry > Date.now()) {
            return res.status(401).json({ message: "Unauthorized access." });
        };

        if(!user.authentication.token) {
            return res.status(401).json({ message: "Unauthorized access." });
        };

        const otp = crypto.randomInt(100000, 999999);
        const otpExpiry = Date.now() + 600000;
        const token = crypto.randomBytes(89).toString('hex');

        const isMailSent = await sendMail({
            from:`No-reply <${process.env.MAIL_ID}>`,
            to: email.toLowerCase(),
            subject: "Resend OTP",
            html: `<h1>Your OTP is ${otp}</h1>`,
        });

        if(!isMailSent) {
            return res.status(400).json({ message: "Unable to send OTP" });
        };

        user.authentication.otp = otp;
        user.authentication.otpExpiry = otpExpiry;
        user.authentication.token = token;
        user.isVerified = false;
        user.loggedIn.loginAttempts = 0;
        const jwtToken = generateToken({
            id: user._id,
            token: token,
            createdAt: Date.now(),
        });

        await user.save();
        return res.status(201).json({ otpToken: jwtToken , message: "OTP sent to your email address." });

    } catch (error) {
        next(error);
    };
};