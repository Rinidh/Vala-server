const { default: mongoose } = require("mongoose");
const connectToDB = require("../../../startup/db");
const {
  News,
  validateNews,
  validateNewsPatchReq,
} = require("../../../models/news");

jest.mock("../../../startup/logger"); //logger being used at startup/db.js, hence winston-mongodb is invoked, which causes errors

describe("News model", () => {
  const validNewsData = {
    heading: "News model test",
    info: "This is a test for news model",
    imageUrl: "https://test/news-model",
  };

  beforeAll(async () => await connectToDB());

  afterEach(async () => await News.deleteMany({}));

  describe("Model/document creation", () => {
    afterEach(() => jest.restoreAllMocks());

    it("should create a news document if valid data", () => {
      const newNews = new News(validNewsData);

      expect(newNews).toMatchObject(validNewsData);
      expect(newNews.date).toBeInstanceOf(Date);
    });

    it("should save the document in the DB upon calling .save()", async () => {
      const newNews = new News(validNewsData);

      const newsInDB = await newNews.save();

      expect(async () => await newNews.save()).not.toThrow();
      expect(newsInDB).toMatchObject(validNewsData);
    });

    it("should throw an exception if invalid data", async () => {
      const invalidNewsData = {
        ...validNewsData,
        imageUrl: "invalid url", //lacks the 'http://' pattern
      };

      // const validateMockFn = jest.spyOn(News, "validate");

      try {
        await new News(invalidNewsData).save();
      } catch (err) {
        expect(err.message).toMatch(/news validation failed/);
        // expect(validateMockFn).toHaveBeenCalled(); //for some reason, mongoose doesn't call the validate() on the invalidNewsData before creating new News(), but it still throws an error about validation
      }
    });
  });

  describe("validateNews()", () => {
    it("should succeed validation for valid information", () => {
      const { error } = validateNews(validNewsData);

      expect(error).toBeUndefined();
    });

    it("should fail validation for invalid information", () => {
      const { error } = validateNews({ validNewsData, heading: "" });

      expect(error.details[0].message).toBe(
        '"heading" is not allowed to be empty'
      );
    });
  });

  describe("validateNewsPatchReq()", () => {
    it("should succeed validation for valid information", () => {
      const { error } = validateNewsPatchReq({
        heading: "new heading to patch",
      });

      expect(error).toBeUndefined();
    });

    it("should fail validation for invalid information", () => {
      const { error } = validateNewsPatchReq({ validNewsData, heading: "" });

      expect(error.details[0].message).toBe(
        '"heading" is not allowed to be empty'
      );
    });
  });

  afterAll(async () => await mongoose.connection.close());
});
