import { getDateString } from 'src/common/utils/utils.service';
import * as winston from 'winston';

export default winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    // Add a timestamp to the console logs
    winston.format.timestamp(),
    // Add colors to you logs
    winston.format.colorize({
      all: true,
      colors: { info: 'green', error: 'red' },
    }),
    // What the details you need as logs
    winston.format.printf(({ timestamp, level, message, context, trace }) => {
      return `${timestamp} [${context}] ${level}: ${message}${trace ? `\n${trace}` : ''}`;
    }),
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({
      filename: `./logs/${getDateString()}_error.log`,
      level: 'error',
    }),
    new winston.transports.File({
      filename: `./logs/${getDateString()}_combine.log`,
    }),
  ],
  exitOnError: true,
});
