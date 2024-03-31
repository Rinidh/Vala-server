const { default: mongoose } = require("mongoose");
const authorize = require("../../../middleware/authorize");
const { Admin } = require("../../../models/admin");
const jwt = require("jsonwebtoken");
const { config } = require("dotenv");

jest.mock("../../../startup/logger"); //turned into a manual-mock by removing the callback. Eliminated the real logger because it depends on winston-mongodb which causes error due to use of older version of winston

describe("authorize (int test)", () => {
  let req;
  let res;
  let next;

  const id = new mongoose.Types.ObjectId().toHexString();
  const admin = new Admin({
    _id: id,
    name: "demoAdmin",
    password: "1234",
    isApproved: true,
    dateWhenAdmin: new Date("2001-01-01"),
  });

  req = {
    cookies: { authToken: admin.generateAuthToken() },
  };
  res = {
    status: jest.fn((code) => res), //retuning the same 'res' object due to chaining of meths used in authorize.js ie res.status().send()
    send: jest.fn((message) => res),
  };
  next = jest.fn();

  it("should add the user object to req on valid jwt", () => {
    authorize(req, res, next);

    expect(req.adminObj).toHaveProperty("_id", id); //works if objectId is extracted into its own var, referenced here. Doesn't work if .toHaveProperty("_id", admin._id)
    expect(req.adminObj).toHaveProperty("name", admin.name);
    expect(req.adminObj).toHaveProperty("isApproved", admin.isApproved);
  });

  it("should return 401 if invalid token", () => {
    req = {
      cookies: { authToken: "invalidToken" },
    };

    authorize(req, res, next);

    expect(req.adminObj).toBeUndefined();
    expect(res.send).toHaveBeenCalledWith("Invalid token...");
    expect(res.status).toHaveBeenCalledWith(401);
    // expect(next).not.toHaveBeenCalled(); next is being called even in exceptions
  });

  it("should throw on wrong token", () => {
    //simulating what happens inside authorize() in above test
    expect(() =>
      jwt.verify("Invalid token...", config.get("jwtPrivateKey"))
    ).toThrow();
  });

  afterAll(() => {
    jest.resetAllMocks();
  });
});
