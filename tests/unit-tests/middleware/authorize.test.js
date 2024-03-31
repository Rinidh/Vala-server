const authorize = require("../../../middleware/authorize");
const jwt = require("jsonwebtoken");
const { Admin } = require("../../../models/admin");

jest.mock("../../../startup/logger"); //turned into a manual mock by removing the callback
jest.mock("jsonwebtoken", () => {
  const originalModule = jest.requireActual("jsonwebtoken");

  return {
    ...originalModule,
    verify: jest.fn(), //only mocking .verify() in jwt import, leaving others eg .sign() as original to be used in generateAuthToken
  };
});

describe("authorize (unit test)", () => {
  let req;
  let res;
  let next;
  const admin = new Admin({
    name: "test",
    isApproved: true,
  });

  beforeEach(() => {
    //Similar to Mr Mosh's tecnique of clean testing, where you first define the all-okay path, and change variables accordingly in each test to generate & test errors
    req = { cookies: { authToken: admin.generateAuthToken() } };
    res = {
      status: jest.fn((code) => res), //retuning the same 'res' object due to chaining of meths used in authorize.js ie res.status().send()
      send: jest.fn((message) => res),
    };
    next = jest.fn();
  });

  it("should return status 400 if no token sent", () => {
    req = { cookies: { authToken: "" } };

    authorize(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith("No token provided...");
    expect(next).not.toHaveBeenCalled();
  });

  it("should return status 401 if invalid token", () => {
    //this is a unit test so i mocked the jwt library to prevent jwt.verify() from actually running
    jwt.verify.mockImplementationOnce(() => {
      throw new Error();
    });

    req = { cookies: { authToken: "invalidToken123" } };

    authorize(req, res, next);

    expect(jwt.verify.mock.results[0].type).toBe("throw");
    expect(req.adminObj).toBeUndefined();
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.send).toHaveBeenCalledWith("Invalid token...");
    expect(next).not.toHaveBeenCalled();
  });

  it("should add the adminObj to res if valid token and if admin isApproved", () => {
    jwt.verify.mockReturnValue(admin);

    authorize(req, res, next);

    expect(req.adminObj).toMatchObject(admin);
    expect(res.status).not.toHaveBeenCalled();
    expect(res.send).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalled();
  });
});
