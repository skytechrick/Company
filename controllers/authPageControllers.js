import fs from 'fs';
import path from 'path';

export const authentication = async ( req , res , next ) => {
    const folderPath = path.join(process.cwd(), '/pages/authenticationPage.html');
    return res.status(200).sendFile(folderPath);
};