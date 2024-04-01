const { MongoServerError } = require("mongodb");
const error = require("../../../middleware/error");
const logger = require("../../../startup/logger"); //__mocks__
const { MongooseError } = require("mongoose");

jest.mock("../../../startup/logger", () => ({
  error: jest.fn().mockImplementation((msg, ...metaData) => {}),
}));

describe("error middleware", () => {
  let err;
  const req = {};
  const res = {
    status: jest.fn().mockReturnThis(),
    send: jest.fn().mockReturnThis(),
  };
  const next = jest.fn();

  afterEach(() => {
    logger.error.mockClear();
  });

  it("should handle mongodb duplicate key error", () => {
    err = new MongoServerError({
      code: 11000,
    });

    error(err, req, res, next);

    expect(logger.error).toHaveBeenCalledWith(
      "Duplicate key in mongoDB! - ",
      expect.objectContaining({
        code: 11000,
      })
    );
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith(
      "Oops! Something went wrong at server..."
    );
    expect(next).not.toHaveBeenCalled();
  });

  it("should handle any mongodb error", () => {
    err = new MongoServerError({});

    error(err, req, res, next);

    expect(logger.error).toHaveBeenCalledWith(
      "MongoError! - ",
      expect.any(Object) //logger.error() should have been called with 'any object' as 2nd arg
    );
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith(
      "Oops! Something went wrong at server..."
    );
  });

  it("should handle any mongoose error", () => {
    err = new MongooseError();

    error(err, req, res, next);

    expect(logger.error).toHaveBeenCalledWith(
      "MongooseError! - ",
      expect.any(Object) //logger.error() should have been called with 'any object' as 2nd arg
    );
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith(
      "Oops! Something went wrong at server..."
    );
  });

  //add new cases in error.js and test here...

  it("should handle any other error", () => {
    err = new Error("An error msg...");

    error(err, req, res, next);

    expect(logger.error).toHaveBeenCalledWith(
      "An error msg...",
      expect.any(Object) //logger.error() should have been called with 'any object' as 2nd arg
    );
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith(
      "Oops! Something went wrong at server..."
    );
  });
});
