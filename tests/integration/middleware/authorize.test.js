const { default: mongoose } = require("mongoose");
const authorize = require("../../../middleware/authorize");
const { Admin } = require("../../../models/admin");

jest.mock("../../../startup/logger", () => {
  error: jest.fn();
}); //turns the imported logger obj in authorize.js into a mocked obj during execution. This prevents the bugs in winston-mongodb from also running when importing logger that uses winston-mongodb
// I have avoided importing the logger here to mock its .error() meth and rather used mocking-partials to modify .error() meth

describe("authorize (int test)", () => {
  it("should add the user object to req on valid jwt", async () => {
    const id = new mongoose.Types.ObjectId().toHexString();

    const admin = new Admin({
      _id: id,
      name: "demoAdmin",
      isApproved: true,
      dateWhenAdmin: new Date("2001-01-01"),
    });

    const req = {
      cookies: { authToken: admin.generateAuthToken() },
    };
    const res = {};
    const next = jest.fn();

    await authorize(req, res, next);

    expect(req.adminObj).toHaveProperty("_id", id); //works if objectId is extracted into its own var, referenced here. Doesn't work if .toHaveProperty("_id", admin._id)
    expect(req.adminObj).toHaveProperty("name", admin.name);
    expect(req.adminObj).toHaveProperty("isApproved", admin.isApproved);
  });
});
