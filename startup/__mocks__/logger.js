const { createLogger, transports } = require("winston");

module.exports = createLogger({
  level: "info",
  transports: [new transports.Console()],
});
