import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import morgan from 'morgan';
import path from 'path';
import swaggerUi from 'swagger-ui-express';

import { config } from './config';
import routes from './routes';
import { apiLimiter } from './middlewares/rateLimiter';
import { errorHandler, notFoundHandler } from './middlewares/errorHandler';
import { swaggerSpec } from './config/swagger';

const app: Application = express();

// Trust proxy for rate limiting behind reverse proxies (Nginx/Render/Heroku)
app.set('trust proxy', 1);

// Security Headers
app.use(
  helmet({
    contentSecurityPolicy: config.isProduction ? undefined : false,
    crossOriginEmbedderPolicy: false,
  })
);

// CORS configuration
const allowedOrigins = [
  config.frontendUrl,
  'http://localhost:3000',
  'http://localhost:3001',
  'http://127.0.0.1:3000',
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, postman)
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) !== -1 || !config.isProduction) {
        return callback(null, true);
      }
      return callback(new Error('CORS request blocked by SPORTZONE security policy'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'x-guest-id'],
  })
);

// Compression
app.use(compression());

// Body Parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Cookie Parser
app.use(cookieParser());

// Request logging (skip in test environment)
if (config.env !== 'test') {
  app.use(morgan(config.isProduction ? 'combined' : 'dev'));
}

// Serve uploaded local images
app.use('/uploads', express.static(path.resolve(process.cwd(), 'uploads')));

// Swagger API Documentation UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, { explorer: true }));
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, { explorer: true }));
app.get('/api-docs.json', (_req: Request, res: Response) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// Root Welcome Endpoint
app.get('/', (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'SPORTZONE E-Commerce API is running.',
    version: '1.0.0',
    documentation: '/api-docs',
    endpoints: '/api/v1',
  });
});

// Apply rate limiter to API v1
app.use('/api/v1', apiLimiter, routes);

// 404 Route Handler
app.use(notFoundHandler);

// Centralized Error Handler
app.use(errorHandler);

export default app;

