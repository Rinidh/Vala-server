const { MongoError } = require("mongodb");
const logger = require("../startup/logger");
const { MongooseError } = require("mongoose");

module.exports = function (err, req, res, next) {
  switch (
    true //always runs
  ) {
    case err.code === 11000:
      logger.error("Duplicate key in mongoDB! - ", err);
      res.status(500).send("Oops! Something went wrong at server...");
      break;
    case err instanceof MongoError:
      logger.error("MongoError! - ", err);
      res.status(500).send("Oops! Something went wrong at server...");
      break;
    case err instanceof MongooseError:
      logger.error("MongooseError! - ", err);
      res.status(500).send("Oops! Something went wrong at server...");
      break;
    case err:
      logger.error(err.message, err);
      res.status(500).send("Oops! Something went wrong at server...");
      break;

    //add more error handling
  }
};
