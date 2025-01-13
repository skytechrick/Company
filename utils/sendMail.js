import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();
const SMPT_HOST = process.env.SMPT_HOST;
const MAIL_ID = process.env.MAIL_ID;
const MAIL_PASS = process.env.MAIL_PASS;

const transporter = nodemailer.createTransport({
    host: SMPT_HOST,
    port: 465,
    secure: true,
    auth: {
        user: MAIL_ID,
        pass: MAIL_PASS
    }
});

export const sendMail = async (mailOptions) => {
    try{
        let info = await transporter.sendMail(mailOptions);
        return info? info : false;
    }catch (e){
        return false;
    };
};
