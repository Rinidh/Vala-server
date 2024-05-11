//this file is much more complicated to write tests for, especially the 2nd test

//I tried to mock the winston.transports.MongoDB/Console/File with automock and manual mock to simply return a string eg "a MongoDB transport instance" instead
//of the real transport, but createLogger in logger.js requires a real transports array
//Hence I would either learn more about the classes and types of winston transports
//OR find a way to only mock the transports in that 2nd test, without affecting logger.js

const winston = require("winston");
const {
  initializeErrorCatchers,
  transportsForErrorLogs,
} = require("../../../startup/error-catchers");
const logger = require("../../../startup/logger");

jest.mock("winston");
jest.mock("winston-mongodb");
jest.mock("../../../startup/logger");

describe("Initialize general ex and rej handlers (error-catchers.js)", () => {
  it("should call .exceptions.handle() and .rejections.handle() to initialize builtin handlers of winston", () => {
    logger.exceptions.handle = jest.fn();
    logger.rejections.handle = jest.fn();

    initializeErrorCatchers();

    expect(logger.exceptions.handle).toHaveBeenCalled();
    expect(logger.rejections.handle).toHaveBeenCalled();
  });

  //Incomplete!
  // it("transportsForErrorLogs() should return right transports according to env", () => {
  //   console.log(winston.transports.Console);

  //   const transportsArray = transportsForErrorLogs();
  // });

  //then mimick a rejection and exception to see if they are caught by the handlers
});
