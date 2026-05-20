import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { apiReference } from '@scalar/express-api-reference';

import router from './routes';
import globalErrorHandler from './middlewares/globalErrorHandler';

const app: Application = express();

/**
 * Middlewares
 */
app.use(express.json());
app.use(cors());

app.use((req, _res, next) => {
  req.url = req.url.replace(/^\/{2,}/, '/');
  next();
});

/**
 * Routes
 */
app.use('/api', router);
app.use('/api/v1', router);

/**
 * Root Route
 */
app.get('/', (_req: Request, res: Response) => {
  res.send('blank page server running successfully');
});

/**
 * Scalar API Documentation
 */
app.use('/docs', (req: Request, res: Response, next) => {
  const openapiPath = path.resolve(__dirname, '../openapi.json');

  if (!fs.existsSync(openapiPath)) {
    return res.status(404).json({
      success: false,
      message: 'API docs not generated yet',
    });
  }

  const openapiDocument = JSON.parse(
    fs.readFileSync(openapiPath, 'utf-8')
  );

  return apiReference({
    theme: 'default',
    layout: 'classic',
    darkMode: true,

    customCss: `
      :root{
        --scalar-background-1:#0b1120;
        --scalar-background-2:#111827;
        --scalar-background-3:#1f2937;

        --scalar-color-1:#ffffff;
        --scalar-color-2:#d1d5db;
        --scalar-color-3:#9ca3af;

        --scalar-border-color: rgba(255,255,255,.08);
      }

      body{
        background:
          radial-gradient(circle at top left, #172554 0%, transparent 30%),
          radial-gradient(circle at top right, #4c1d95 0%, transparent 30%),
          linear-gradient(135deg,#020617 0%,#0f172a 50%,#111827 100%) !important;
        min-height:100vh;
        color:white !important;
      }

      .scalar-app,
      .scalar-api-reference,
      .scalar-client{
        max-width: 1152px !important;
        margin:auto !important;
        padding: 32px 20px !important;
        background: transparent !important;
      }

      /* Sidebar */
      aside{
        position: sticky !important;
        top: 0;
        height: 100vh;
        backdrop-filter: blur(20px);
        background: rgba(255,255,255,.03)!important;
        border-right: 1px solid rgba(255,255,255,.08)!important;
        padding-top:20px !important;
      }

      /* Cards and Endpoints */
      .card,
      .section,
      .endpoint{
        background: rgba(255,255,255,.04)!important;
        border: 1px solid rgba(255,255,255,.08)!important;
        border-radius: 12px !important;
        padding: 16px !important;
        margin-bottom: 16px !important;
      }

      /* Title */
      h1{
        font-size:46px !important;
        font-weight:900 !important;
        margin-bottom:10px !important;
        background: linear-gradient(
          90deg,
          #60a5fa,
          #818cf8,
          #c084fc
        );
        -webkit-background-clip:text;
        -webkit-text-fill-color:transparent;
      }

      h2, h3{
        color:white !important;
        font-weight:700 !important;
      }

      /* Method badges */
      .method{
        padding:6px 14px !important;
        border-radius:6px !important;
        font-weight:700 !important;
      }

      .method.get{ background:#16a34a!important; color:white!important; }
      .method.post{ background:#2563eb!important; color:white!important; }
      .method.patch{ background:#d97706!important; color:white!important; }
      .method.put{ background:#7c3aed!important; color:white!important; }
      .method.delete{ background:#dc2626!important; color:white!important; }

      /* Scrollbar */
      ::-webkit-scrollbar{
        width:8px;
      }

      ::-webkit-scrollbar-thumb{
        background:#475569;
        border-radius:999px;
      }
    `,

    spec: {
      content: openapiDocument,
    },
  })(req as any, res as any, next);
});

/**
 * Global Error Handler
 */
app.use(globalErrorHandler);

/**
 * 404 Handler
 */
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