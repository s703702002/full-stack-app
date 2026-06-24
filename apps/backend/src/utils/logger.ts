import pino from 'pino';
import { env } from './validateEnv.js';

const isDev = env.NODE_ENV !== 'production';

const logger = pino({
  level: env.LOG_LEVEL,
  base: undefined,
  redact: {
    paths: [
      'req.body.password',
      'req.body.newPassword',
      'req.body.totpCode',
      'req.headers.cookie',
      'req.headers.authorization',
    ],
  },
  timestamp: () => `,"time":"${new Date().toISOString()}"`,
  ...(isDev && {
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'SYS:yyyy-mm-dd HH:MM:ss',
      },
    },
  }),
});

export default logger;
