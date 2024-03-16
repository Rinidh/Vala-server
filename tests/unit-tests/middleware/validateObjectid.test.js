const { default: mongoose } = require("mongoose");
const validateObjectId = require("../../../middleware/validateObjectId");

describe("validateObjectId", () => {
  it("should send res status 400 if invalid mongo id", () => {
    const req = {
      body: { _id: "1234" },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
    const next = jest.fn();

    validateObjectId(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith("Invalid _id...");
    expect(next).not.toHaveBeenCalled();
  });

  it("should run next() if valid mongo id", () => {
    const req = {
      body: { _id: new mongoose.Types.ObjectId().toHexString() },
    };
    const res = {};
    const next = jest.fn(); //avoid repetition and use mr mosh's tehnique

    validateObjectId(req, res, next);

    expect(next).toHaveBeenCalled();
  });
});
