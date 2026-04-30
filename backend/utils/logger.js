import pino from 'pino';

const isDev = process.env.NODE_ENV !== 'production';

const logger = pino({
  // 設定最低要印出的層級 (trace, debug, info, warn, error, fatal)
  level: process.env.LOG_LEVEL || 'info',

  redact: {
    paths: [
      'req.body.password',
      'req.body.newPassword',
      'req.body.totpCode',
      'req.headers.cookie',
      'req.headers.authorization',
    ],
  },

  // 開發環境套用 pino-pretty 讓終端機變漂亮
  ...(isDev && {
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true, // 彩色輸出
        translateTime: 'SYS:yyyy-mm-dd HH:MM:ss', // 人類可讀的時間格式
        ignore: 'pid,hostname', // 隱藏比較不需要的機器資訊
      },
    },
  }),
});

export default logger;
