const mongoose = require("mongoose");
const logger = require("../../../startup/logger");
const config = require("config");

// jest.mock("../../../startup/logger", () => {
//   return {
//     info: jest.fn(),
//     error: jest.fn()
//   };
// });
//or simply replace .info() with a mock
jest.mock("../../../startup/logger");

describe("Start up MongoDB Connection (db.js)", () => {
  let asyncMockConnect;

  beforeEach(() => {
    asyncMockConnect = jest.fn().mockResolvedValue();
    mongoose.connect = asyncMockConnect;
    logger.info = jest.fn();
    logger.error = jest.fn();
  });

  it("connects successfully to the database", async () => {
    await require("../../../startup/db")();

    const testDB = config.get("db");
    expect(asyncMockConnect).toHaveBeenCalledWith(testDB);
    expect(logger.info).toHaveBeenCalledWith(
      `Connected successfully to ${testDB}`
    );
  });

  it("throws out an error if unfound db connection string", async () => {
    //the thrown out error is handled at error.js middleware
    const errorMsg = "Configuration property 'db' is not defined";
    config.get = jest.fn().mockImplementationOnce(() => {
      throw new Error(errorMsg);
    });

    expect(() => require("../../../startup/db")()).toThrow(errorMsg);

    config.get.mockRestore(); //jest.restoreAllMocks() only works for SpyOn funcs
  });

  it("handles connection rejections", async () => {
    const errorMsg = "Failed to connect...";
    mongoose.connect = jest.fn().mockRejectedValue(new Error(errorMsg));

    await require("../../../startup/db")();

    expect(logger.error).toHaveBeenCalledWith(errorMsg);
  });
});
