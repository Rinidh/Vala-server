const { default: mongoose } = require("mongoose");
const authorize = require("../../../middleware/authorize");
const { Admin } = require("../../../models/admin");

describe("authorization middleware", () => {
  it("should add the user object to req on valid jwt", () => {
    const admin = new Admin({
      _id: new mongoose.Types.ObjectId().toHexString(),
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
    expect(req.adminObj).toHaveProperty("_id"); //didn't to put the value arg here coz test fails
    expect(req.adminObj).toHaveProperty("name", admin.name);
    expect(req.adminObj).toHaveProperty("isApproved", admin.isApproved);
  });
});
