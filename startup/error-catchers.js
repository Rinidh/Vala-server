const { transports, format } = require("winston");
require("winston-mongodb");
const logger = require("./logger");

module.exports = function () {
  const transportsForErrorLogs = () => {
    if (process.env.NODE_ENV === "production") {
      return [
        new transports.MongoDB({
          db: "mongodb://127.0.0.1:27017/Vala-server",
          collection: "log-ex-rej",
          level: "info",
          options: { useUnifiedTopology: true },
          format: format.combine(
            insertMetaForWinstonMongo(),
            format.timestamp({ format: "YYYY-MM-DD hh:mm:ss.SSS A" }),
            format.printf(
              (info) => `${info.timestamp} - ${info.level}: ${info.message}`
            )
          ),
        }),
        new transports.File({
          filename: "ex-rej.log",
        }),
      ];
    } else {
      return [new transports.Console({ format: format.colorize() })]; //colorize not working for built in exceptions-logger
    }
  };

  logger.exceptions.handle(...transportsForErrorLogs()); //these are the built in exception and rejection catchers
  logger.rejections.handle(...transportsForErrorLogs());
};
