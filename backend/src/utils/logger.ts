import pino from 'pino';
import { env } from '../utils/validateEnv.js';

const isDev = env.NODE_ENV !== 'production';

const logger = pino({
  level: env.LOG_LEVEL,

  redact: {
    paths: [
      'req.body.password',
      'req.body.newPassword',
      'req.body.totpCode',
      'req.headers.cookie',
      'req.headers.authorization',
    ],
  },

  ...(isDev && {
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'SYS:yyyy-mm-dd HH:MM:ss',
        ignore: 'pid,hostname', // 隱藏比較不需要的機器資訊
      },
    },
  }),
});

export default logger;
