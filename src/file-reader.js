import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs/promises';

export class FileReader {
    constructor(baseDir = 'data') {
        const __filename = fileURLToPath(import.meta.url);
        const __dirname = path.dirname(__filename);
        this.projectRoot = path.join(__dirname, '..');
        this.baseDir = baseDir;
    }

    /**
     * Resolves the full path for a given filename
     * @param {string} fileName - Name of the file to read
     * @returns {string} Full path to the file
     */
    resolvePath(fileName) {
        return path.join(this.projectRoot, this.baseDir, fileName);
    }

    /**
     * Reads a file from the data directory
     * @param {string} fileName - Name of the file to read
     * @param {string} encoding - File encoding (default: 'utf8')
     * @returns {Promise<string|null>} File contents or null if error
     */
    async readFile(fileName, encoding = 'utf8') {
        try {
            const filePath = this.resolvePath(fileName);
            
            // Check if file exists
            await fs.access(filePath);
            
            // Read the file content
            const content = await fs.readFile(filePath, encoding);
            return content;
        } catch (err) {
            if (err.code === 'ENOENT') {
                console.error(`File not found: ${fileName} in ${this.baseDir} directory`);
            } else {
                console.error(`Error reading file ${fileName}:`, err.message);
            }
            return null;
        }
    }

    /**
     * Checks if a file exists in the data directory
     * @param {string} fileName - Name of the file to check
     * @returns {Promise<boolean>} True if file exists, false otherwise
     */
    async fileExists(fileName) {
        try {
            await fs.access(this.resolvePath(fileName));
            return true;
        } catch {
            return false;
        }
    }
}

// Export both the class and a convenience function
export async function readFileAsync(fileName, encoding = 'utf8') {
    const reader = new FileReader();
    return await reader.readFile(fileName, encoding);
}
