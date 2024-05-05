const mongoose = require("mongoose");
const logger = require("../startup/logger");
const config = require("config");

module.exports = function () {
  const db = config.get("db"); //if no "db" config value, .get() throws an error: "Error: Configuration property 'db' is not defined"
  return mongoose
    .connect(db)
    .then(() => {
      logger.info(`Connected successfully to ${db}`);
    })
    .catch((err) => {
      logger.error(err.message);
    });
};
//if any rejections, they will be handled by the universal winston rejection handler in index.js
