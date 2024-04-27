const mongoose = require("mongoose");
const { Email } = require("../../../models/email");
const { Admin } = require("../../../models/admin");
const { approvedAgent_promise } = require("./agentWithApprovedCookie");

jest.mock("../../../startup/logger"); //being used at index.js

let agentWithApprovedCookie;

beforeAll(async () => (agentWithApprovedCookie = await approvedAgent_promise));

describe("GET /", () => {
  const anEmail = { emailId: "test@emails" };

  beforeAll(async () => {
    await new Email(anEmail).save();
  });

  afterAll(async () => {
    await Email.deleteMany({});
  });

  const execute = () => {
    return agentWithApprovedCookie.get("/api/emails"); //the http-only cookie is automatically sent
  };

  //the case of no token, invalid token... (via cookie) being sent to server is tested at the integration test of authorize

  it("should return the saved emails", async () => {
    const res = await execute();

    expect(res.status).toBe(200);
    expect(res.body[0]).toMatchObject(anEmail);
  });
});

describe("POST /", () => {
  let anEmail;
  beforeEach(() => (anEmail = "test@emails"));
  afterEach(async () => await Email.deleteMany({})); //to clear the db before next test, or else running tests for 2nd time causes errors. Always leave the db clean

  const execute = () => {
    return agentWithApprovedCookie
      .post("/api/emails")
      .send({ emailId: anEmail });
  };

  it("should return 400 if invalid information posted", async () => {
    anEmail = "invalidEmail"; //without --@--

    const res = await execute();

    expect(res.status).toBe(400);
    expect(res.error.text).toMatch(/Invalid Email/); //as custom configured in email.js model
    //find the error msgs in res.error prop, not in res.body when using supertest
  });

  it("should return 400 if email exists", async () => {
    await new Email({ emailId: "test@emails" }).save(); //saving the same email before
    //OR run execute 2 times; the 2nd time will fail

    const res = await execute();

    expect(res.status).toBe(400);
    expect(res.error.text).toBe("Email already exists...");
  });

  it("should save the email if valid information posted", async () => {
    const res = await execute();

    const emailSavedInDB = await Email.findOne(); //we expect only one doc at db

    expect(res.status).toBe(200);
    expect(res.text).toBe("Saved the email id...");
    expect(emailSavedInDB).toMatchObject({ emailId: "test@emails" });
  });
});

afterAll(async () => {
  await Admin.deleteMany({});
  await mongoose.connection.close(); //Close any MongoDB connections
  //The other servers initiated by supertest are closed by it
});
