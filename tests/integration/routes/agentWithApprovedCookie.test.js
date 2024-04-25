const request = require("supertest");
const app = require("../../../index");
const { Admin } = require("../../../models/admin");

const agent = request.agent(app);

const approvedAdminObj = {
  name: "test",
  password: "test-password",
  email: { emailId: "test@products" },
  isApproved: true,
};

const approvedAgent_promise = new Promise((res, rej) => {
  (async () => {
    try {
      //below is an already approved admin for test purposes. In real, an user gets approval if another approved admin modifies the stored user doc in db. When the user re-logs in MANUALLY in a new browser session, he gets the new token (as cookie) with his isApproved prop as true
      const approvedAdmin = new Admin(approvedAdminObj);
      await approvedAdmin.save();

      const token_isApprovedTrue = approvedAdmin.generateAuthToken();
      const cookie_isApprovedTrue = `authToken=${token_isApprovedTrue}`;
      agent.jar.setCookie(cookie_isApprovedTrue);

      //or you can create a normal admin user (initially not approved), then access the db and modify the isApproved field to true, then re-login manually ie send a post req to /admin/login to get a new cookie which is set to approved

      res(agent);
    } catch (error) {
      rej(error);
      console.error(error);
    }
  })();
});

module.exports = approvedAgent_promise;
