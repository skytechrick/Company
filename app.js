import dotenv from 'dotenv';
import express from 'express';
import fs from 'fs';
import bodyParser from 'body-parser';
import admin from "./utils/googleConfig.js";
import { errorLog } from "./utils/errorLog.js";
dotenv.config();

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use("/files", express.static("./public"));

app.get('/', async (req, res) => {
    let file = fs.readFileSync('./index.html');
    res.send(file.toString());
});

// Handle authentication with Firebase token
app.post('/auth/authenticate', async (req, res) => {
    const token = req.body.token;
  
    try {
        const decodedToken = await admin.auth().verifyIdToken(token);
        console.log('User verified:', decodedToken);
        res.status(200).send({ message: 'User authenticated', user: decodedToken });
    } catch (error) {
        console.error('Authentication error:', error);
        res.status(401).send({ message: 'Authentication failed' });
    }
});

app.use( async (err, req, res, next) => {

    if(req.isApi){
        await errorLog(err);
        return res.status(500).send({
            message: "Internal server error",
            error: process.env.NODE_ENV === 'development' ? err.message : undefined,
        });
    };

    await errorLog(err);
    // return res.status(500).sendFile('./public/error.html');
    return res.status(500).send('500 error, Internal server error');
});

app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
});