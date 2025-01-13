import mongoose from "mongoose";
import dotenv from "dotenv";
import { optional } from "zod";
dotenv.config();
const URL = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_HOST}/${process.env.DB_NAME}`;

const db = mongoose.connection;

mongoose.connect(URL);

db.on("error", console.error.bind(console, "connection error:"));

db.once("open", () => {
    console.log("Connected to MongoDB");
});

const newSchema = mongoose.Schema;
const newModel = mongoose.model;

const userSchema = newSchema({
    email: {
        type: String,
        required: true,
        unique: true,
        max: 255,
        min: 4,
        lowercase: true,
    },
    personalInfo:{
        firstName: {
            type: String,
            required: true,
            max: 255,
            min: 3,
        },
        lastName: {
            type: String,
            max: 255,
            min: 3,
            default: null,
        },
        mobileNumber: {
            type: Number,
            default: null
        },
        age: {
            type: Number,
            min: 13,
            max: 120,
            default: null,
        },
        gender: {
            type: String,
            required: true,
            default: null,
        },
    },
    password: {
        required: false,
        type: String,
        max: 1024,
        min: 8,
    },
    isBan: {
        type: Boolean,
        default: false,
    },
    isVerified: {
        type: Boolean,
        default: false,
    },
    loggedIn:{
        token: {
            type: String,
            default: null,
        },
        lastLoggedIn: {
            type: Date,
            default: null,
        },
        loginAttempts: {
            type: Number,
            default: 0,
        },
    },
    authentication: {
        otp: {
            type: Number,
            default: null,
        },
        otpExpires: {
            type: Date,
            default: null,
        },
        token: {
            type: String,
            default: null,
        },
    },
    cart:[],
    buyNow:[],
    orders:[],
    addresses:[],
    searchHistory:[],
    lastViewedProducts:[],
    interestedProducts:[],
    favouriteProducts:[],
    notifications:[],
    gsbCoins:[],
    wishlist:[],
    overview:[],
    bankAccount:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "userBankAccount",
    },
    createdAt: {
        type: Date,
        default: Date.now(),
    },
    updatedAt: {
        type: Date,
        default: Date.now(),
    }
});
const userBankAccountSchema = newSchema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
    },
    bankName: {
        type: String,
        default: "",
    },
    benificiaryName: {
        type: String,
        default: "",
    },
    accountNumber: {
        type: Number,
        default: 0,
    },
    ifscCode: {
        type: String,
        default: "",
    }
});


export default {
    user: newModel("user", userSchema),
    userBankAccount: newModel("userBankAccount", userBankAccountSchema),
};