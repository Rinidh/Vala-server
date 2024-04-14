const request = require("supertest");
const app = require("../../../index");
const mongoose = require("mongoose");
const { Review } = require("../../../models/review");
const { Admin } = require("../models/admin");

jest.mock("../../../startup/logger");

//to use throughout all tests
const reviewObj = {
  name: "1", //using min length possible
  review: "1",
  emailId: "test@reviews",
};

const agent = request.agent(app);
const admin = {
  name: "test",
  password: "123",
  emailId: "testAdmin@reviews",
};
beforeAll(async () => {
  const res = await agent.post("/api/admin").send(admin);
  const cookie = res.headers["set-cookie"][0];
  agent.jar.setCookie(cookie);
});

describe("GET /", () => {
  const review = new Review(reviewObj);
  beforeAll(async () => {
    await review.save();
  });

  it("should get all news stored in db", async () => {
    const res = await agent.get("/api/reviews");

    expect(res._body[0]).toMatchObject(reviewObj);
  });

  afterAll(async () => {
    await Review.deleteMany({});
  });
});

describe("POST /", () => {
  let review;
  beforeEach(() => (review = reviewObj));
  afterEach(async () => await Review.deleteMany({}));

  const execute = () => agent.post("/api/reviews").send(review);

  it("should return 400 if invalid information posted", async () => {
    review = { name: "" };

    const res = await execute();
    console.log(res._body);

    expect(res.status).toBe(400);
    expect(res.error.text).toMatch(new RegExp("Validation failed at server"));
  });

  it("should save the news if valid information", async () => {
    const res = await execute();

    const reviewInDB = await Review.findOne();

    expect(res.status).toBe(200);
    expect(res.text).toMatch(/Saved the review.../);
    expect(reviewInDB).toMatchObject(review);
  });
});

afterAll(async () => {
  await Admin.deleteMany({});
  await mongoose.connection.close();
});
