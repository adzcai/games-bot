const { createLogger, format, transports } = require('winston');

const {
  combine, timestamp, colorize, json, simple,
} = format;

global.logger = createLogger({
  transports: [
    new transports.Console({
      format: combine(timestamp(), colorize(), json(), simple()),
    }),
  ],
});
