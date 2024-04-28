const { Admin, validateAdmin } = require("../../../models/admin");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const config = require("config");
const connectToDB = require("../../../startup/db");
const { dateStringRegex_onlyMonth } = require("../../utils");

jest.mock("../../../startup/logger");

describe("Admin Model", () => {
  beforeAll(async () => await connectToDB());

  describe("validateAdmin function", () => {
    it("should successfully validate an admin object with correct data", () => {
      const adminObj = {
        name: "JohnDoe",
        password: "123456",
        emailId: "john.doe@example.com",
      };
      const result = validateAdmin(adminObj);
      expect(result.error).toBeUndefined();
    });

    it("should throw a validation error when provided with an admin object that has an invalid email format", () => {
      const adminObj = {
        name: "JohnDoe",
        password: "123456",
        emailId: "john.doeexample.com", // Missing '@'
      };
      const result = validateAdmin(adminObj);
      expect(result.error).toBeDefined();
      expect(result.error.details[0].message).toMatch(
        /fails to match the required pattern/
      );
    });
  });

  describe("generateAuthToken instance method", () => {
    const admin = new Admin({
      name: "Mark Doe",
      password: "123",
      email: { emailId: "markdoe@example.com" },
    });

    it("should return a valid JWT token for an admin", () => {
      const token = admin.generateAuthToken();
      const decoded = jwt.verify(token, config.get("jwtPrivateKey"));

      expect(decoded).toMatchObject({
        _id: admin._id.toString(),
        name: admin.name,
        isApproved: admin.isApproved,
      });
    });

    it("should throw an exception if no jwtPrivatekey defined", () => {
      jest.mock("config");
      const errorMsg = "secretOrPrivateKey is not valid key material"; //this is the message that config.get() throws when no jwt key setting defined
      config.get = jest.fn().mockReturnValue(new Error(errorMsg));

      expect(() => admin.generateAuthToken()).toThrow(errorMsg);
    });

    afterAll(() => jest.restoreAllMocks());
  });

  describe("Document creation", () => {
    const validAdminData = {
      name: "valid new name",
      password: "123", //minLength
      email: { emailId: "models-test@admin" },
    };

    afterEach(async () => await Admin.deleteMany({}));

    it("should create an admin document if valid data", () => {
      const newAdmin = new Admin(validAdminData);

      expect(newAdmin).toMatchObject(validAdminData);
      expect(newAdmin.dateWhenAdmin).toMatch(dateStringRegex_onlyMonth);
    });

    it("should save the document in the DB upon calling .save()", async () => {
      const newAdmin = new Admin(validAdminData);

      expect(async () => await newAdmin.save()).not.toThrow();
    });

    it("should throw an exception if invalid data", async () => {
      const invalidAdminData = {
        ...validAdminData,
        email: { emailId: "invalid email" }, //lacks @ and has spaces
      };

      try {
        await new Admin(invalidAdminData).save();
      } catch (err) {
        expect(err.message).toMatch(/validation failed/);
      }
    });
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });
});
