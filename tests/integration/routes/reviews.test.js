const mongoose = require("mongoose");
const { Review } = require("../../../models/review");
const { Admin } = require("../../../models/admin");
const { approvedAgent_promise } = require("./agentWithApprovedCookie");
const { Email } = require("../../../models/email");

jest.mock("../../../startup/logger");

//to use throughout all tests
const reviewObj = {
  name: "1", //using min length possible
  review: "1",
  emailId: "test@reviews",
};

let agent;
beforeAll(async () => (agent = await approvedAgent_promise));

describe("GET /", () => {
  const review = new Review({
    name: reviewObj.name,
    review: reviewObj.review,
    email: { emailId: reviewObj.emailId },
  });
  beforeAll(async () => {
    await review.save();
  });

  it("should get all news stored in db", async () => {
    const res = await agent.get("/api/reviews");

    expect(res._body[0]).toMatchObject({
      name: reviewObj.name,
      review: reviewObj.review,
      email: { emailId: reviewObj.emailId },
    });
  });

  afterAll(async () => {
    await Review.deleteMany({});
    await Email.deleteMany({});
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

    expect(res.status).toBe(400);
    expect(res.error.text).toMatch(new RegExp("Validation failed at server"));
  });

  it("should save the news if valid information", async () => {
    const res = await execute();

    const reviewInDB = await Review.findOne();

    expect(res.status).toBe(200);
    expect(res.text).toMatch(/Saved the review.../);
    expect(reviewInDB).toMatchObject({
      //cannot match object of reviewInDB with review (ie reviewObj) because of the different way the email and emailId props are set. Hence I had to explicitly define a new object to compare with as below
      name: reviewObj.name,
      review: reviewObj.review,
      email: { emailId: reviewObj.emailId },
    });
  });
});

afterAll(async () => {
  await Admin.deleteMany({});
  await mongoose.connection.close();
});
