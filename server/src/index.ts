import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import dotenv from 'dotenv';
import morgan from 'morgan';
import { config } from './config/index.js';

dotenv.config();

const app = express();
const _URL = config.url;
const _PORT = config.port;

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
app.listen(_PORT, () => {
  console.log(`🚀 Server running on ${_URL}`);
});

export default app;
