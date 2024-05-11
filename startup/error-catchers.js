const { transports, format } = require("winston");
const _ = require("lodash");
require("winston-mongodb");
const logger = require("./logger");

//need to insert this custom format to ably apply meta data info to mongodb docs
const insertMetaForWinstonMongo = format((logEntry) => {
  logEntry.metadata = _.chain(logEntry)
    .omit(logEntry, ["level", "message"])
    .omitBy((value, key) => _.isSymbol(key))
    .value();
  // For winston-mongodb < 5.x, use:
  // logEntry.meta = _.chain(logEntry).omit(logEntry, ['level', 'message']).omitBy((value, key) => _.isSymbol(key)).value();
  return logEntry;
});

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

const initializeErrorCatchers = function () {
  logger.exceptions.handle(...transportsForErrorLogs()); //these are the built in exception and rejection catchers/handlers
  logger.rejections.handle(...transportsForErrorLogs());
  //despite these above handlers catch ex and rej, ex and rej still end up to the node process which catches and logs them to console??
};

module.exports = { initializeErrorCatchers, transportsForErrorLogs };
