const { logger } = require("./logger");

module.exports = function () {
  //TO CATCH ANY ERRORS AFTER THIS FILE IS LOADED IN INDEX.JS

  process.on("uncaughtException", (ex) => {
    logger.error(ex.message, ex);
    console.error(ex); //for dev only. Coz even before logger logs to console, process exits

    process.exit(1); // best practice to exit with non-zero exit code in error-situations
  });

  process.on("unhandledRejection", (rejErrorObj) => {
    //what is accessed from args is the Error obj that is thrown
    logger.error(rejErrorObj.message, rejErrorObj);
    console.error(ex);

    process.exit(1);
  });
  //winston also provides a direct way of logging the error and exiting the process via winston.ExceptionHandler and winston.RejectionHandler class instances...
};
