import 'dotenv/config';
import express from 'express';
import passport from 'passport';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import pinoHttp from 'pino-http';
import session from 'express-session';
import { RedisStore } from 'connect-redis';

import setupPassport from './config/passport.js';
import apiRoutes from './routes/index.js';
import { globalErrorHandler } from './middlewares/errorMiddleware.js';
import { checkHealth } from './controllers/healthController.js';
import logger from './utils/logger.js';
import redisClient from './config/redis.js';
import { PREFIX } from './constants/redisKeys.js';

const app = express();
const SESSION_MAX_AGE = Number.parseInt(process.env.SESSION_EXPIRY) || 3600000;

app.get('/health', checkHealth);

// --- 全域中介軟體 ---
app.use(
  cors({
    origin: 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }),
);
app.use(
  session({
    store: new RedisStore({
      client: redisClient,
      prefix: PREFIX.SESSION,
      ttl: SESSION_MAX_AGE / 1000, // RedisStore 的 ttl 單位是秒
    }),
    secret: process.env.SESSION_SECRET,
    rolling: true,
    resave: false, // 是否每次請求都重新儲存 session，設為 false 減少效能消耗
    saveUninitialized: false, // 是否自動儲存未初始化的 session，設 false 免得浪費空間
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      sameSite: 'lax',
      maxAge: SESSION_MAX_AGE,
    },
  }),
);

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));
app.set('trust proxy', 1);
setupPassport(passport);
app.use(passport.initialize());
app.use(passport.session());

app.use(
  pinoHttp({
    customProps: (req, res) => {
      const props = {
        userId: req.user?.id || 'guest',
        username: req.user?.username || 'anonymous',
      };

      if (res.locals.errorMessage) {
        props.errorMessage = res.locals.errorMessage;
      }

      return props;
    },
    logger,
    serializers: {
      req: (req) => ({ method: req.method, url: req.url, body: req.raw.body }),
      res: (res) => ({ statusCode: res.statusCode }),
    },
  }),
);

// --- 掛載路由 ---
app.use('/', apiRoutes);
app.use(globalErrorHandler);

export default app;
