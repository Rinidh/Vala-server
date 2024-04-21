const { default: mongoose } = require("mongoose");
const validateObjectId = require("../../../middleware/validateObjectId");

describe("validateObjectId", () => {
  it("should return 401 if no id sent in either body or path param", async () => {
    const req = {};
    const res = {
      status: jest.fn().mockReturnThis(), //or jest.fn(()=>res) to enable chaining ie res.status().send()
      send: jest.fn().mockReturnThis(),
    };
    const next = jest.fn();

    validateObjectId(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.send).toHaveBeenCalledWith(
      "No id provided in request body or path parameter..."
    );
  });

  it("should send res status 400 if invalid mongo id", () => {
    const req = {
      body: { _id: "1234" },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
    };
    const next = jest.fn();

    validateObjectId(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith("Invalid _id...");
    expect(next).not.toHaveBeenCalled();
  });

  it("should run next() if valid mongo id in body", () => {
    const req = {
      param: {},
      body: { _id: new mongoose.Types.ObjectId().toHexString() },
    };
    const res = {};
    const next = jest.fn();
    //avoid repetition of above and use mr mosh's tehnique

    validateObjectId(req, res, next);

    expect(next).toHaveBeenCalled();
  });

  it("should run next() if valid mongo id in path paramater", () => {
    const req = {
      params: { id: new mongoose.Types.ObjectId().toHexString() },
      body: {},
    };
    const res = {
      status: jest.fn((code) => res), //retuning the same 'res' object due to chaining of meths ie res.status().send()
      send: jest.fn((message) => res),
    };
    const next = jest.fn();
    //avoid repetition of above and use mr mosh's tehnique

    validateObjectId(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled(); //all .status() are only calls when there is an error
  });
});
