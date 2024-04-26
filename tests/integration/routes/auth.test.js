const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../../../index");
const { Admin } = require("../../../models/admin");
const {
  approvedAgent_promise,
  adminObj,
} = require("./agentWithApprovedCookie");

jest.mock("../../../startup/logger"); //logger being executed upon importation of app from index.js

let approvedCookieAgent;
const agentWithoutCookie = request.agent(app); //for tests that require sending no cookie ie token

beforeAll(async () => (approvedCookieAgent = await approvedAgent_promise));

//to always keep the agentWithoutCookie without a cookie in subsequent tests
// beforeEach(() => agentWithoutCookie.jar.clearCookie("authToken")); //.clear() is not a func??

describe("Default automatic login", () => {
  it("should return 400 if no token sent", async () => {
    // this done by the authorize middleware
    const res = await agentWithoutCookie.post("/api/auth");

    expect(res.status).toBe(400);
    expect(res.error.text).toBe("No token provided...");
  });

  //scenario of when a user sends a token where isApproved is false is tested for in authorize.test.js

  it("should return the logged-in admin user object if valid token sent", async () => {
    const res = await approvedCookieAgent.post("/api/auth");

    expect(res.status).toBe(200);
    expect(res._body).toEqual({
      _id: expect.any(String), //can do more inspection by checking if valid id returned?
      name: adminObj.name,
      emailId: adminObj.email.emailId,
    });
  });
});

describe("Manual login", () => {
  it("should return 400 invalid info sent", async () => {
    const res = await agentWithoutCookie
      .post("/api/auth/login")
      .send({ name_or_emailId: "" });

    expect(res.status).toBe(400);
    expect(res.error.text).toBe("Invalid information...");
  });

  it("should return 400 if incorrect name or emailId", async () => {
    const resWhenWrongName = await agentWithoutCookie
      .post("/api/auth/login")
      .send({ name_or_emailId: "unregistered_name", password: "demoPassword" });

    const resWhenWrongEmail = await agentWithoutCookie
      .post("/api/auth/login")
      .send({
        name_or_emailId: "unregistered_email",
        password: "demoPassword",
      });

    expect(resWhenWrongName.status && resWhenWrongEmail.status).toBe(400); // ("a" && "b") evalutes to the last value after && if both are truthy ie evalutes to "b"
    expect(resWhenWrongName.error.text && resWhenWrongEmail.error.text).toBe(
      "Invalid name or emailId..."
    );
  });

  it("should return 400 if wrong password", async () => {
    const res = await agentWithoutCookie
      .post("/api/auth/login")
      .send({ name_or_emailId: adminObj.name, password: "wrong_password" });

    expect(res.status).toBe(400);
    expect(res.error.text).toBe("Invalid password...");
  });

  //an admin user can send any: his registered name or emailId
  it("should accept registered name", async () => {
    const res = await agentWithoutCookie
      .post("/api/auth/login")
      .send({ name_or_emailId: adminObj.name, password: adminObj.password });

    expect(res.status).toBe(200);
    expect(res._body).toEqual({
      name: adminObj.name,
      emailId: adminObj.email.emailId,
      _id: expect.any(String), //can do more inspection by checking if valid id returned?
    });
  });

  it("should also accept registered email instead of name", async () => {
    const res = await agentWithoutCookie.post("/api/auth/login").send({
      name_or_emailId: adminObj.email.emailId,
      password: adminObj.password,
    });

    expect(res.status).toBe(200);
    expect(res._body).toEqual({
      name: adminObj.name,
      emailId: adminObj.email.emailId,
      _id: expect.any(String),
    });
  });
});

afterAll(async () => {
  await Admin.deleteMany({}); //in each test file, when agentWithApprovedCookie is required(), agentWithApprovedCookie.js runs again to generate a new admin each time, hence it's necessary to delete at end of each test file
  await mongoose.connection.close();
  //The other servers initiated by supertest are closed by it
});
