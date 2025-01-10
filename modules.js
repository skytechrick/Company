import mongoose from "mongoose";
import dotenv from "dotenv";
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

const user = newSchema({
    name: {
        type: String,
        required: true,
        max: 255,
        min: 3,
    },
});

export default {
    user: newModel("User", user),
};