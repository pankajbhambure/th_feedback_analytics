import express, { Application } from 'express';
import { errorHandler, notFoundHandler } from './middlewares/error.middleware';
import routes from './routes';

const app: Application = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/v1', routes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
