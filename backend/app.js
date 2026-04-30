import 'dotenv/config';
import { fileURLToPath } from 'node:url';
import express from 'express';
import passport from 'passport';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import pinoHttp from 'pino-http';

import setupPassport from './config/passport.js';
import apiRoutes from './routes/index.js';
import { globalErrorHandler } from './middlewares/errorMiddleware.js';
import { checkHealth } from './controllers/healthController.js';
import { dirname, join } from './utils/pathHelper.js';
import logger from './utils/logger.js';

setupPassport(passport);

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const app = express();

app.get('/health', checkHealth);

// ==========================================
// 全域中介軟體 (Middlewares)
// ==========================================

app.use(
  cors({
    origin: 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }),
);

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));

app.set('trust proxy', 1);

app.use(passport.initialize());

app.use(
  pinoHttp({
    customProps: (req) => {
      return {
        userId: req.user?.id || 'guest',
        username: req.user?.username || 'anonymous',
      };
    },
    logger,
    serializers: {
      req: (req) => ({ method: req.method, url: req.url, body: req.raw.body }),
      res: (res) => ({ statusCode: res.statusCode }),
    },
  }),
);

// ==========================================
// 掛載路由 (Routes)
// ==========================================
app.use(express.static(join(__dirname, 'public')));

app.use('/', apiRoutes);
app.use(globalErrorHandler);

// ==========================================
// 啟動伺服器
// ==========================================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  logger.info(`🚀 伺服器已啟動: http://localhost:${PORT}`);
});
