import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import router from './routes';
import globalErrorHandler from './middlewares/globalErrorHandler';

const app: Application = express();

// Parsers
app.use(express.json());
app.use(cors());

app.use((req, _res, next) => {
  req.url = req.url.replace(/^\/{2,}/, '/');
  next();
});

// Application routes
app.use('/api', router);
app.use('/api/v1', router);

// Testing route (as requested by user)
app.get('/', (req: Request, res: Response) => {
  res.send('blank page server runing susseefully');
});

// Global error handler
app.use(globalErrorHandler);

// Not Found handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: 'API Not Found',
    errorMessages: [
      {
        path: req.originalUrl,
        message: 'API Not Found',
      },
    ],
  });
});

export default app;
