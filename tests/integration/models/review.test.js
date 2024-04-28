const { default: mongoose } = require("mongoose");
const { Review, validateReview } = require("../../../models/review");
const connectToDB = require("../../../startup/db");
const { dateStringRegex_onlyMonth } = require("../../utils");

jest.mock("../../../startup/logger");

describe("Review model", () => {
  beforeAll(async () => {
    await connectToDB();
  });

  afterEach(async () => {
    await Review.deleteMany({});
  });

  const validReviewData = {
    name: "John Doe",
    review: "This is a great product!",
    emailId: "john.doe@example.com",
  };

  describe("validateReview function", () => {
    it("should successfully validate a review object with valid data", () => {
      const { error } = validateReview(validReviewData);
      expect(error).toBeUndefined();
    });

    it("should throw an error when provided with invalid email format in the review object", () => {
      const invalidReviewData = {
        name: "John Doe",
        review: "This is a great product!",
        emailId: "john.doeexample.com", // Missing '@'
      };
      const { error } = validateReview(invalidReviewData);
      expect(error).toBeDefined();
      expect(error.details[0].message).toMatch(
        /fails to match the required pattern/
      );
    });
  });

  describe("Document creation", () => {
    it("should create a review document if valid data", () => {
      const newReview = new Review({
        name: validReviewData.name,
        review: validReviewData.review,
        email: { emailId: validReviewData.emailId },
      });

      expect(newReview).toMatchObject({
        name: validReviewData.name,
        review: validReviewData.review,
        email: { emailId: validReviewData.emailId },
      });
      expect(newReview.date).toMatch(dateStringRegex_onlyMonth);
    });

    it("should save the document in the DB upon calling .save()", async () => {
      const newReview = new Review({
        name: validReviewData.name,
        review: validReviewData.review,
        email: { emailId: validReviewData.emailId },
      });

      const reviewInDB = await newReview.save();

      expect(async () => await newReview.save()).not.toThrow();
      expect(reviewInDB).toMatchObject({
        name: validReviewData.name,
        review: validReviewData.review,
        email: { emailId: validReviewData.emailId },
      });
    });

    it("should throw an exception if invalid data", async () => {
      const invalidReviewData = {
        ...validReviewData,
        emailId: "invalid email", //lacks @ and has spaces
      };

      try {
        await new Review(invalidReviewData).save();
      } catch (err) {
        expect(err.message).toMatch(/validation failed/);
      }
    });
  });

  afterAll(async () => {
    // Close the mongoose connection
    await mongoose.connection.close();
  });
});
