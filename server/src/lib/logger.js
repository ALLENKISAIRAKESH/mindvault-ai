import pino from 'pino';

const isProduction = process.env.NODE_ENV === 'production';

const logger = pino({
  level: process.env.LOG_LEVEL || (isProduction ? 'info' : 'debug'),
  ...(isProduction
    ? {
        // Cloud Logging structured format
        messageKey: 'message',
        formatters: {
          level(label) {
            // Map pino levels to Cloud Logging severity
            const severityMap = {
              trace: 'DEBUG',
              debug: 'DEBUG',
              info: 'INFO',
              warn: 'WARNING',
              error: 'ERROR',
              fatal: 'CRITICAL',
            };
            return { severity: severityMap[label] || 'DEFAULT' };
          },
        },
      }
    : {
        transport: {
          target: 'pino-pretty',
          options: { colorize: true },
        },
      }),
  // NEVER log these fields
  redact: {
    paths: [
      'req.headers.authorization',
      'req.headers.cookie',
      'apiKey',
      'password',
      'token',
      'secret',
      'credential',
    ],
    censor: '[REDACTED]',
  },
});

export default logger;
