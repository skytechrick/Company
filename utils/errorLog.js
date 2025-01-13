import fs from 'fs/promises';
import path from 'path';

export const errorLog = async (error) => {
    try {
        const folderPath = path.join(process.cwd(), './logs');
        const filePath = path.join(folderPath, 'error.log');

        try {
            await fs.access(folderPath);
        } catch {
            await fs.mkdir(folderPath, { recursive: true });
        };

        try {
            await fs.access(filePath);
        } catch {
            await fs.writeFile(filePath, '', 'utf8');
        };

        const errorLog = `Error: Something went wrong. Time: ${new Date().toISOString()}\n` + `${error.stack || error.message || 'No stack trace available'}\n\n`;
        await fs.appendFile(filePath, errorLog, 'utf8');

    } catch (logError) {
        console.error('Error logging error:', logError);
    }
};
