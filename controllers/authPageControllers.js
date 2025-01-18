import fs from 'fs';
import path from 'path';

import { verifyToken } from '../utils/jwtController.js';
import Modules from "../modules.js";

export const authentication = async ( req , res , next ) => {
    try {

        const folderPath = path.join(process.cwd(), '/pages/authenticationPage.html');
        const token = req.signedCookies.token;
        if (!token) {
            return res.status(200).clearCookie('token').sendFile(folderPath);
        };
        
        const decoded = verifyToken(token);
        if (!decoded) {
            return res.status(200).clearCookie('token').sendFile(folderPath);
        };
        
        const user = await Modules.user.findById( decoded.id );
        
        if (!user) {
            return res.status(200).clearCookie('token').sendFile(folderPath);
        };
        
        if (user.loggedIn.token !== decoded.token) {
            return res.status(200).clearCookie('token').sendFile(folderPath);
        };
        
        return res.status(302).redirect('/');
    } catch (error) {
        next(error);
    };
};