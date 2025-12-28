import express from 'express';
import { errorHandler } from './middlewares/errorHandler';
import mainRouter from './routes/indexRoutes'; 
const app = express();

app.use(express.json());

app.use('/api', mainRouter);


app.use(errorHandler);

export default app;
