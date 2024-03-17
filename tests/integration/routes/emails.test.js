const request = require("supertest");
const app = require("../../../index");
const { Email } = require("../../../models/email");
const { Admin } = require("../../../models/admin");

describe("/api/emails", () => {
  describe("GET /", () => {
    const agent = request.agent(app);
    const anEmail = { emailId: "test@emails" };
    const anAdmin = {
      name: "test",
      password: "test-password",
      emailId: "test@emails",
    };

    beforeAll(async () => {
      const res = await agent.post("/api/admin").send(anAdmin); //getting a cookie to use
      const cookie = res.headers["set-cookie"][0];
      agent.jar.setCookie(cookie);

      await new Email(anEmail).save();
    });

    afterAll(async () => {
      await Admin.deleteMany({});
      await Email.deleteMany({});
    });

    const execute = async () => {
      return agent.get("/api/emails"); //the http-only cookie is automatically sent
    };

    //the case of no token, invalid token... (via cookie) being sent to server is tested at the integration test of authorize

    it("should return the saved emails", async () => {
      const res = await execute();

      expect(res.status).toBe(200);
      expect(res.body[0]).toMatchObject(anEmail);
    });
  });
});
