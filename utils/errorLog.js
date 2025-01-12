import fs from 'fs';
import path from 'path';

export async function logError(error) {
    try {
        const folderPath = path.join(process.cwd(), '../logs');
        const filePath = path.join(folderPath, 'error.log');
        if (!fs.existsSync(folderPath)) {
            fs.mkdirSync(folderPath, { recursive: true });
        };
        if (!fs.existsSync(filePath)) {
            fs.writeFileSync(filePath, '', 'utf8');
        };
        const errorLog = `Error: Something went wrong. Time: ${new Date().toISOString()}\n` + (error.stack || error.message || 'No stack trace available') + '\n\n';
        fs.appendFileSync(filePath, errorLog, 'utf8');
    } catch (logError) {
        console.error('Error logging error:', logError);
    };
};