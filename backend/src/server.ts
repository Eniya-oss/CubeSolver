import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import apiRouter from './routes/api';
import { initDatabase, isMockDb } from './config/db';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for all mobile and web clients
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request Logger
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[HTTP] ${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`);
  });
  next();
});

// Root & Health Check Endpoints
app.get('/', (req: Request, res: Response) => {
  res.json({
    name: 'Cube Solver REST API',
    version: '1.0.0',
    status: 'online',
    timestamp: new Date().toISOString(),
    databaseMode: isMockDb ? 'Resilient In-Memory' : 'MySQL Live Connection'
  });
});

app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    uptime: process.uptime(),
    dbReady: true,
    databaseMode: isMockDb ? 'mock' : 'mysql'
  });
});

app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    uptime: process.uptime(),
    dbReady: true,
    databaseMode: isMockDb ? 'mock' : 'mysql'
  });
});

// Mount Central API Router at both /api and root /
app.use('/api', apiRouter);
app.use('/', apiRouter);

// Global Error Handler
app.use((err: any, req: Request, res: Response, next: any) => {
  console.error('[Unhandled Error]', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

const HOST = '0.0.0.0';

// Boot Server
async function startServer() {
  try {
    await initDatabase();
    app.listen(Number(PORT), HOST, () => {
      console.log(`====================================================`);
      console.log(`🚀 Cube Solver API Server running on ${HOST}:${PORT}`);
      console.log(`🌐 Base URL: http://localhost:${PORT}`);
      console.log(`📡 Health Check: http://localhost:${PORT}/api/health`);
      console.log(`====================================================`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

export default app;
