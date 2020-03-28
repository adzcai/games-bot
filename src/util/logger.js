const { createLogger, format, transports } = require('winston');

const {
  combine, timestamp, colorize, json, simple,
} = format;

module.exports = createLogger({
  transports: [
    new transports.Console({
      format: combine(timestamp(), colorize(), json(), simple()),
    }),
  ],
});
