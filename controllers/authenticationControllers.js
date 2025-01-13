import dotenv from "dotenv";
import admin from "../utils/googleConfig.js";
import { signupSchema }  from "../utils/zodSchema.js";
import { hashPassword } from "../utils/passwordController.js";
import Module from "../modules.js";
import crypto from "crypto";
import { sendMail } from "../utils/sendMail.js";

dotenv.config();

export const signup = async ( req , res , next ) => {
    try {
        s
        const body = signupSchema.safeParse(req.body);
        if(!body.success) {
            return res.status(400).json({ message: "Unauthorized access" });
        };

        const { email , password , firstName , lastName , mobileNumber } = body.data;

        const isUser = await Module.user.fineOne({email});

        if(isUser) {
            return res.status(302).json({ message: "User already exists" , redirect: "/api/v1/authentication/login", redirectMessage: "Login page" });
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
            from:`No-reply<${process.env.MAIL_ID}>`,
            to: email.toLowerCase(),
            subject: "Congratulation your account has been created, verify your email address",
            html: `<h1>Your OTP is ${otp}</h1>`,
        });
        if(!isMailSent) {
            return res.status(400).json({ message: "Unable to send OTP" });
        };
        console.log(isMailSent);
        

        const newUser = await Module.user(newUserObject);

        await newUser.save().then( response =>{
            console.log(response);
            return res.status(201).json({ otpToken: token , message: "Account created successfully, please verify your email address." });
        }).catch((error)=>{
            return res.status(500).json({ message: "Internal server error, unable to create account." });
        });

    } catch (error) {
        req.isApiError = true;
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