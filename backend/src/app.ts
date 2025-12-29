import express from 'express';
import path from 'path';
import { errorHandler } from './middlewares/errohandler.middleware';
import mainRouter from './routes/index.routes';
import { ensureDir, getUploadDir } from './utils/file';

const app = express();

// Ensure uploads directory exists
ensureDir(getUploadDir());

app.use(express.json());

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

app.use('/api', mainRouter);

app.use(errorHandler);

export default app;
