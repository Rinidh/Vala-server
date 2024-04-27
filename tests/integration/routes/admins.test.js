const request = require("supertest");
const app = require("../../../index");
const mongoose = require("mongoose");
const { Admin } = require("../../../models/admin");
const {
  approvedAgent_promise,
  adminObj,
} = require("./agentWithApprovedCookie");

jest.mock("../../../startup/logger"); //logger being used at index.js

const anAdmin = {
  //data for a new admin to send in post reqs
  name: "extra admin",
  password: "extra admin 1234",
  emailId: "test@extraAdmin",
};

let agentWithApprovedCookie;
let agentWithoutCookie; //for tests that require sending no cookie ie token

beforeAll(async () => (agentWithApprovedCookie = await approvedAgent_promise));
beforeEach(() => (agentWithoutCookie = request.agent(app))); //making sure the agentWithoutCookies is always without cookies by issuing a new agent before each describe block below

describe("GET /", () => {
  it("should return status 400 if no token sent", async () => {
    const res = await agentWithoutCookie.get("/api/admins");

    expect(res.status).toBe(400);
    expect(res.error.text).toBe("No token provided...");
  });

  it("should return all saved admins if token sent", async () => {
    const res = await agentWithApprovedCookie.get("/api/admins");

    expect(res.status).toBe(200);
    expect(res._body[0]).toMatchObject({
      _id: expect.any(String),
      name: adminObj.name,
      emailId: adminObj.email.emailId,
    });
  });

  it("should return only approved admins if 'isApproved' query sent in req", async () => {
    //we create an extra admin in db that has 'isApproved' as false and test to see that it is NOT fetched
    let extraUnapprovedAdmin = new Admin({
      name: anAdmin.name,
      password: anAdmin.password,
      email: { emailId: anAdmin.emailId },
      isApproved: false,
    });
    extraUnapprovedAdmin = await extraUnapprovedAdmin.save();

    const res = await agentWithApprovedCookie.get(
      "/api/admins/?isApproved=true"
    );

    expect(res.status).toBe(200);
    expect(res._body).toHaveLength(1);
    expect(res._body[0]).toMatchObject({
      _id: expect.any(String),
      name: adminObj.name,
      emailId: adminObj.email.emailId,
    });
    expect(res._body[0]).not.toMatchObject({
      name: extraUnapprovedAdmin.name,
      emailId: extraUnapprovedAdmin.email.emailId,
    });

    await Admin.deleteOne({ _id: extraUnapprovedAdmin._id });
  });
});

describe("POST /", () => {
  let adminDataToRegister;
  beforeEach(() => (adminDataToRegister = anAdmin));
  afterAll(
    async () => await Admin.deleteOne({ name: adminDataToRegister.name })
  );

  const execute = () =>
    agentWithoutCookie.post("/api/admins").send(adminDataToRegister);

  it("should return 400 if invalid information sent", async () => {
    adminDataToRegister = { name: "extra@admin" }; //'@' is not allowed in a name as defined in models/admin.js

    const res = await execute();

    expect(res.status).toBe(400);
    expect(res.text).toMatch(new RegExp("fails to match the required pattern"));
  });

  it("should return 400 if re-registering an already saved email", async () => {
    //beacuse an admin was already registered at the beginning of this test file, in agentWithApprovedCookie.js (with emailId as "test@agentWithAprovedCookie"), we can try re-registering this
    adminDataToRegister = {
      ...adminDataToRegister,
      emailId: "test@agentWithAprovedCookie",
    };

    const res = await execute();

    expect(res.status).toBe(400);
    expect(res.error.text && res.text).toMatch(
      new RegExp(
        `Admin with email ${adminDataToRegister.emailId} already exists...`
      )
    );
  });

  it("should save the new admin if valid info sent and return a cookie", async () => {
    const res = await execute();

    expect(res.status).toBe(200);
    expect(res.text).toBe("Saved admin request...");
    expect(res.headers["set-cookie"][0]).toMatch(/authToken=/);
  });
});

describe("PATCH /", () => {
  let idOfAdminToUpdate;
  let savedAdmin;

  beforeAll(async () => {
    savedAdminWith_idAsObjectId = await new Admin({
      name: anAdmin.name,
      password: anAdmin.password,
      email: { emailId: anAdmin.emailId },
    }).save();
    savedAdmin = {
      ...savedAdminWith_idAsObjectId._doc,
      _id: savedAdminWith_idAsObjectId._id.toString(),
    }; //savedAdmin now has _id as a hex string
  });
  beforeEach(() => (idOfAdminToUpdate = savedAdmin._id));
  afterAll(async () => await Admin.deleteOne({ _id: savedAdmin._id }));

  const execute = () =>
    agentWithApprovedCookie.patch(`/api/admins/${idOfAdminToUpdate}`);

  it("should return 400 if no token sent", async () => {
    const res = await agentWithoutCookie.patch(
      `/api/admins/${idOfAdminToUpdate}`
    );

    expect(res.status).toBe(400);
    expect(res.text).toMatch(new RegExp("No token provided..."));
  });

  //the other tests for when an admin is not yet approved, invalid token sent, invalid _id sent in param etc are already covered in tests for authorize.test.js, validateObjectId etc

  it("should return 404 if wrong id sent in url parameter", async () => {
    idOfAdminToUpdate = new mongoose.Types.ObjectId().toHexString();

    const res = await execute();

    expect(res.status).toBe(404);
    expect(res.error.text).toBe("No admin found with given id...");
  });

  it("should return the updated admin and a new cookie if valid id sent in url parameter", async () => {
    const res = await execute();

    let updatedAdminInDB = await Admin.findOne();
    updatedAdminInDB = {
      ...updatedAdminInDB._doc,
      _id: updatedAdminInDB._id.toString(), //to change _id to hex string for easy comparison
    };

    expect(res.status).toBe(200);
    expect(res._body.isApproved).toBeTruthy();
    expect(res._body).toMatchObject({
      _id: savedAdmin._id,
      name: savedAdmin.name,
      emailId: savedAdmin.email.emailId,
    });
    expect(res.headers["set-cookie"][0]).toMatch(/authToken=/);
    expect(updatedAdminInDB.isApproved).toBeTruthy(); //confirming if the doc in db is indeed updated
  });
});

afterAll(async () => {
  await Admin.deleteMany({});
  await mongoose.connection.close();
  //The other servers initiated by supertest are closed by it
});
