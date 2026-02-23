import express from 'express';
import path from 'path';
import cors from 'cors';
import { env } from './config/env';
import { errorHandler } from './middlewares/errohandler.middleware';
import { generalLimiter } from './middlewares/rateLimit.middleware';
import mainRouter from './routes/index.routes';
import { ensureDir, getUploadDir } from './utils/file';

const app = express();

ensureDir(getUploadDir());

app.use(express.json());
app.use(cors({
  origin: env.CORS_ORIGIN,
  credentials: true,
}));
app.use(generalLimiter);

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

app.use('/api', mainRouter);

app.use(errorHandler);

export default app;
