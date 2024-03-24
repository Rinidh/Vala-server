const authorize = require("../../../middleware/authorize");
const jwt = require("jsonwebtoken");
const { Admin } = require("../../../models/admin");

jest.mock("../../../startup/logger", () => {
  error: jest.fn();
});
jest.mock("jsonwebtoken", () => {
  const originalModule = jest.requireActual("jsonwebtoken");

  return {
    ...originalModule,
    verify: jest.fn(), //only mocking .verify() in jwt import, leaving others eg .sign() as original to be used in generateAuthToken
  };
});

describe("authorize (unit test)", () => {
  it("should return status 400 if no token sent", () => {
    const req = { cookies: "" };
    const res = {
      status: jest.fn((code) => res), //retuning the same 'res' object due to chaining of meths used in authorize.js ie res.status().send()
      send: jest.fn((message) => res),
    };
    const next = jest.fn();

    authorize(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith("No token provided...");
    expect(next).not.toHaveBeenCalled();
  });

  it("should add the adminObj to res if valid token and if admin isApproved", () => {
    //this is a unit test so i mocked the jwt library to prevent jwt.verify() from actually running
    const admin = new Admin({
      name: "test",
      isApproved: true,
    });
    const token = admin.generateAuthToken();
    jwt.verify.mockReturnValue(admin);

    const req = { cookies: { authToken: token } };
    const res = {
      status: jest.fn((code) => res), //retuning the same 'res' object due to chaining of meths used in authorize.js ie res.status().send()
      send: jest.fn((message) => res),
    };
    const next = jest.fn();

    authorize(req, res, next);

    expect(req.adminObj).toMatchObject(admin);
    expect(res.status).not.toHaveBeenCalled();
    expect(res.send).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalled();
  });
});
