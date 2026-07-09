import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';

import env from './config/env';
import connectDatabase from './config/database';
import logger from './utils/logger';
import swaggerSpec from './config/swagger';
import { requestIdMiddleware } from './middleware/requestId';
import errorHandler from './middleware/error';

// Routers
import authRouter from './routes/auth';
import usersRouter from './routes/users';
import resumeRouter from './routes/resume';
import atsRouter from './routes/ats';
import interviewRouter from './routes/interview';
import coverLetterRouter from './routes/coverLetter';
import projectsRouter from './routes/projects';
import linkedinRouter from './routes/linkedin';
import jobsRouter from './routes/jobs';
import roadmapRouter from './routes/roadmap';
import settingsRouter from './routes/settings';
import subscriptionsRouter from './routes/subscriptions';
import dashboardRouter from './routes/dashboard';
import adminRouter from './routes/admin';
import SystemConfig from './models/SystemConfig';
import healthRouter from './routes/health';

const app = express();

// 1. Core security and parsing headers
app.use(helmet());
app.use(compression());
app.use(cookieParser());
const allowedOrigins = [env.CLIENT_URL, 'http://localhost:5173', 'http://localhost:3000'];
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));
app.use(express.json({
  verify: (req: any, res, buf) => {
    if (req.originalUrl && req.originalUrl.includes('/webhook')) {
      req.rawBody = buf;
    }
  }
}));
app.use(express.urlencoded({ extended: true }));

// 2. Correlation Tracking & Logging
app.use(requestIdMiddleware);

// Morgan HTTP request stream direct to Winston logger
const morganFormat = env.NODE_ENV === 'production' ? 'combined' : 'dev';
app.use(
  morgan(morganFormat, {
    stream: {
      write: (message: string) => {
        logger.info(message.trim());
      },
    },
  })
);

// 3. Global API Rate Limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many requests from this IP, please try again after 15 minutes',
});
app.use('/api/', limiter);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20, // limit each IP to 20 auth calls
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many login or registration attempts, please try again after 15 minutes',
});

// 4. Swagger API Documentation Endpoint
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// 5. REST APIs (V1 Prefix)
const v1Router = express.Router();

v1Router.use('/auth', authLimiter, authRouter);
v1Router.use('/users', usersRouter);
v1Router.use('/resumes', resumeRouter);
v1Router.use('/ats', atsRouter);
v1Router.use('/interviews', interviewRouter);
v1Router.use('/cover-letters', coverLetterRouter);
v1Router.use('/projects', projectsRouter);
v1Router.use('/linkedin', linkedinRouter);
v1Router.use('/jobs', jobsRouter);
v1Router.use('/roadmaps', roadmapRouter);
v1Router.use('/settings', settingsRouter);
v1Router.use('/subscriptions', subscriptionsRouter);
v1Router.use('/dashboard', dashboardRouter);
v1Router.use('/admin', adminRouter);

// Global Maintenance Mode Guard
v1Router.use(async (req: any, res: any, next: any) => {
  try {
    if (req.originalUrl.includes('/admin') || req.originalUrl.includes('/auth') || req.originalUrl.includes('/health')) {
      return next();
    }
    const config = await SystemConfig.findOne();
    if (config?.maintenanceMode) {
      if (req.user && ['SuperAdmin', 'Admin'].includes(req.user.role)) {
        return next();
      }
      return res.status(503).json({
        success: false,
        message: 'System is under scheduled maintenance. Please check back later.',
      });
    }
    next();
  } catch (error) {
    next();
  }
});

v1Router.use('/', healthRouter); // Mounts /health, /live, /ready under /api/v1/

app.use('/api/v1', v1Router);

// 6. Global Error Handling Middleware
app.use(errorHandler);

// Server startup hook
const startServer = async (): Promise<void> => {
  try {
    await connectDatabase();
    app.listen(env.PORT, () => {
      logger.info(`🚀 SERVER: Running on port ${env.PORT} in ${env.NODE_ENV} mode.`);
      logger.info(`📄 SWAGGER: API Docs available at http://localhost:${env.PORT}/api-docs`);
    });
  } catch (error) {
    logger.error('❌ SERVER: Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
