const { createLogger, transports, format } = require("winston");

module.exports = createLogger({
  level: "info",
  transports: [
    new transports.File({
      filename: "testLogs.log",
      format: format.timestamp({ format: "YYYY-MM-DD hh:mm:ss.SSS A" }),
    }),
  ],
});
