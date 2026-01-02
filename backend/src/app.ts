import express from 'express';
import path from 'path';
import cors from 'cors'; // Import cors
import { errorHandler } from './middlewares/errohandler.middleware';
import mainRouter from './routes/index.routes';
import { ensureDir, getUploadDir } from './utils/file';

const app = express();

// Ensure uploads directory exists
ensureDir(getUploadDir());

app.use(express.json());
app.use(cors({
  origin: 'http://localhost:5173', // Allow requests from your frontend
  credentials: true, // Allow cookies to be sent
}));

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

app.use('/api', mainRouter);

app.use(errorHandler);

export default app;
