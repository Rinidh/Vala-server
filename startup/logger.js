const { format, transports, createLogger, addColors } = require("winston");
require("winston-mongodb"); // for unknown some reason, winston-mongodb is hindering the integration test
const _ = require("lodash");

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

//handle log colors
addColors({
  error: "red",
  info: "yellow",
  warn: "gray", //brown is not supported
});
const colorizedFormat = format.combine(
  format.colorize({ all: true }),
  format.timestamp({ format: "YYYY-MM-DD hh:mm:ss.SSS A" }),
  format.printf((info) => `${info.timestamp} - ${info.level}: ${info.message}`)
);
const uncolorizedFormat = format.combine(
  format.timestamp({ format: "YYYY-MM-DD hh:mm:ss.SSS A" }),
  format.printf((info) => `${info.timestamp} - ${info.level}: ${info.message}`)
);

const logger = createLogger({
  level: "info", //means only logs of level 'info' OR HIGHER ie upto 'error' will be stored
  format: uncolorizedFormat,
  transports: [
    new transports.File({
      filename: "onlyErrors.log",
      level: "error", //only error messages go here
    }),
    new transports.File({ filename: "allLogs.log" }), //level info and higher, up to error
    new transports.Console({
      format: colorizedFormat,
    }),
    new transports.MongoDB({
      db: "mongodb://127.0.0.1:27017/Vala-server",
      collection: "log",
      level: "info",
      options: { useUnifiedTopology: true },
      format: format.combine(insertMetaForWinstonMongo(), uncolorizedFormat),
    }),
  ],
});

module.exports = logger;
