import 'dotenv/config';
import express from 'express';
import passport from 'passport';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { pinoHttp } from 'pino-http';
import session from 'express-session';
import { RedisStore } from 'connect-redis';

import setupPassport from './config/passport.js';
import apiRoutes from './routes/index.js';
import { globalErrorHandler } from './middlewares/errorMiddleware.js';
import { checkHealth } from './controllers/healthController.js';
import logger from './utils/logger.js';
import redisClient from './config/redis.js';
import { PREFIX } from './constants/redisKeys.js';
import { env } from './utils/validateEnv.js';

const app = express();
const SESSION_MAX_AGE = Number.parseInt(env.SESSION_EXPIRY) || 3600000;

app.get('/health', checkHealth);

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
      ttl: SESSION_MAX_AGE / 1000,
    }),
    secret: env.SESSION_SECRET,
    rolling: true,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: env.NODE_ENV === 'production',
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
      const user = (req as express.Request).user as Express.User | undefined;

      const props: Record<string, unknown> = {
        userId: user?.id ?? 'guest',
        username: user?.username ?? 'anonymous',
      };

      if (res.locals.errorMessage) {
        props.errorMessage = res.locals.errorMessage;
      }

      return props;
    },
    logger,
    serializers: {
      req: (req) => ({
        method: req.method,
        url: req.url,
        body: (req.raw as express.Request).body,
      }),
      res: (res) => ({ statusCode: res.statusCode }),
    },
  }),
);

app.use('/', apiRoutes);
app.use(globalErrorHandler);

export default app;
