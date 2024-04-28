const { default: mongoose } = require("mongoose");
const connectToDB = require("../../../startup/db");
const { Email, validateEmail } = require("../../../models/email");
const { dateStringRegex_onlyMonth } = require("../../utils");

jest.mock("../../../startup/logger");

describe("Email model", () => {
  const validEmailData = { emailId: "test@example.com" };

  beforeAll(async () => await connectToDB());

  afterEach(async () => await Email.deleteMany({}));

  describe("Model/document creation", () => {
    it("should create an email document if valid data", () => {
      const newEmail = new Email(validEmailData);

      expect(newEmail).toMatchObject(validEmailData);
      expect(newEmail.dateRecorded).toMatch(dateStringRegex_onlyMonth);
    });

    it("should save the document in the DB upon calling .save()", async () => {
      const newEmail = new Email(validEmailData);

      const emailInDB = await newEmail.save();

      expect(async () => await newEmail.save()).not.toThrow();
      expect(emailInDB).toMatchObject(validEmailData);
    });

    it("should throw an exception if invalid data", async () => {
      const invalidEmailData = {
        ...validEmailData,
        recipient: "invalid-email", // Invalid email format
      };

      try {
        await new Email(invalidEmailData).save();
      } catch (err) {
        expect(err.message).toMatch(/email validation failed/);
      }
    });
  });

  describe("validateEmail()", () => {
    it("should succeed validation for valid information", () => {
      const { error } = validateEmail(validEmailData.emailId);

      expect(error).toBeUndefined();
    });

    it("should fail validation for invalid information", () => {
      const { error } = validateEmail("test-example.com"); //missing @

      expect(error.details[0].message).toMatch(
        / fails to match the required pattern/
      );
    });
  });

  afterAll(async () => await mongoose.connection.close());
});
