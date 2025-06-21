import winston from 'winston';
import path from 'path';
import env from '@/env';

const logDir = 'logs';
const { combine, timestamp, printf, colorize } = winston.format;

// Custom log format
const logFormat = printf(({ level, message, timestamp, ...metadata }) => {
  let msg = `${timestamp} [${level}] : ${message}`;
  if (Object.keys(metadata).length > 0) {
    msg += JSON.stringify(metadata);
  }
  return msg;
});

// Create the logger
const logger = winston.createLogger({
  level: env.LOG_LEVEL,
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    logFormat
  ),
  transports: [
    // Console transport
    new winston.transports.Console({
      format: combine(
        colorize(),
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        logFormat
      ),
    }),
    // File transport for all logs
    new winston.transports.File({
      filename: path.join(logDir, 'info.log'),
      level: 'info',
    }),
    // File transport for error logs
    new winston.transports.File({
      filename: path.join(logDir, 'error.log'),
      level: 'error',
    }),
  ],
});

// Create a stream object for Morgan
export const stream = {
  write: (message: string) => {
    logger.info(message.trim());
  },
};

export default logger;