import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env relative to the config directory (going up to backend/ folder)
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
