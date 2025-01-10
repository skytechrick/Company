import dotenv from 'dotenv';
import express from 'express';
import modules from './Modules.js';

dotenv.config();
const app = express();

app.get('/', async (req, res) => {
    res.send('Hello World');
});

app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
});