import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import dotenv from 'dotenv';
import morgan from 'morgan';
import { config } from './config/index.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from project root (3 levels up from server/src/index.ts)
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const app = express();
const _URL = config.url;
const _PORT = config.port;
const _HOST = config.host;

// Middleware
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(morgan('dev'));
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Castelvento Server is running' });
});

// Start server
app.listen(_PORT, _HOST, () => {
  console.log(`🚀 Server running on ${_URL}`);
});

export default app;
