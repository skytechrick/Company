import dotenv from 'dotenv';
import express from 'express';
import fs from 'fs';
import bodyParser from 'body-parser';
import admin from "./utils/googleConfig.js";
import { errorLog } from "./utils/errorLog.js";
import apiV1Router from "./routes/apiV1Router.js";
dotenv.config();

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use("/files", express.static("./public"));
app.use("/api/v1/", apiV1Router);

app.get('/', async (req, res) => {
    let file = fs.readFileSync('./index.html');
    res.send(file.toString());
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