const { default: mongoose } = require("mongoose");
const authorize = require("../../../middleware/authorize");
const { Admin } = require("../../../models/admin");

describe("authorization middleware", () => {
  it("should add the user object to req on valid jwt", () => {
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

    authorize(req, res, next);

    // expect(req.adminObj).toEqual(
    //   //code is right but not working
    //   expect.objectContaining({
    //     _id: admin._id,
    //     name: admin.name,
    //     isApproved: true,
    //   })
    // );
    expect(req.adminObj).toHaveProperty("_id", id); //works if objectId is extracted into its own var, referenced here. Doesn't work if .toHaveProperty("_id", admin._id)
    expect(req.adminObj).toHaveProperty("name", admin.name);
    expect(req.adminObj).toHaveProperty("isApproved", admin.isApproved);
  });
});
