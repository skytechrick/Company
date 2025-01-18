
import { verifyToken } from "./jwtController";
import Modules from "../modules.js";


export const verifyUserApi = async ( req , res , next ) => {
    try {

        const token = req.signedCookies.token;
        if (!token) {
            return res.status(200).clearCookie('token').json({ message: "Unauthorized access."});
        };
        
        const decoded = verifyToken(token);
        if (!decoded) {
            return res.status(200).clearCookie('token').json({ message: "Unauthorized access."});
        };
        
        const user = await Modules.user.findById( decoded.id );
        
        if (!user) {
            return res.status(200).clearCookie('token').json({ message: "Unauthorized access."});
        };
        
        if (user.loggedIn.token !== decoded.token) {
            return res.status(200).clearCookie('token').json({ message: "Unauthorized access."});
        };

        req.user = user;
        next();

    } catch (error) {
        next(error);
    };
};

export const verifyUserPage = async ( req , res , next ) => {
    try {

        const token = req.signedCookies.token;
        if (!token) {
            return res.status(200).clearCookie('token').redirect('/auth/authentication');
        };
        
        const decoded = verifyToken(token);
        if (!decoded) {
            return res.status(200).clearCookie('token').redirect('/auth/authentication');
        };
        
        const user = await Modules.user.findById( decoded.id );
        
        if (!user) {
            return res.status(200).clearCookie('token').redirect('/auth/authentication');
        };
        
        if (user.loggedIn.token !== decoded.token) {
            return res.status(200).clearCookie('token').redirect('/auth/authentication');
        };

        req.user = user;
        next();

    } catch (error) {
        next(error);
    };
};