const request = require("supertest");
const mongoose = require("mongoose");
const { ObjectId } = require("mongodb");
const app = require("../../../index");
const { Admin } = require("../../../models/admin");
const { News } = require("../../../models/news");

jest.mock("../../../startup/logger");

//to use throughout all tests
const newsObj = {
  heading: "1", //using min length possible
  info: "12345",
  imageUrl: "imgurl_news_test",
};

const agent = request.agent(app);
const admin = {
  name: "test",
  password: "123",
  emailId: "test@news",
};
beforeAll(async () => {
  const res = await agent.post("/api/admin").send(admin);
  const cookie = res.headers["set-cookie"][0];
  agent.jar.setCookie(cookie);
});

describe("GET /", () => {
  const news = new News(newsObj);
  beforeAll(async () => {
    await news.save();
  });

  it("should get all news stored in db", async () => {
    const res = await agent.get("/api/news");

    expect(res._body[0]).toMatchObject(newsObj);
  });

  afterAll(async () => {
    await News.deleteMany({});
  });
});

describe("POST /", () => {
  let news;
  beforeEach(() => (news = newsObj));
  afterEach(async () => await News.deleteMany({}));

  const execute = () => agent.post("/api/news").send(news);

  it("should return 400 if invalid information posted", async () => {
    news = { heading: "", info: "12345", imageUrl: "imgurl_news_test" }; //instead of empty heading, you can also test by posting wrong 'info' or 'imageUrl'. But this should be done when testing 'validateNews()'

    const res = await execute();

    expect(res.status).toBe(400);
    expect(res.error.text).toMatch(new RegExp("heading"));
  });

  it("should save the news if valid information", async () => {
    const res = await execute();

    const newsThatGotStored = await News.findOne();

    expect(res.status).toBe(200);
    expect(res.text).toMatch(/Saved the news post.../);
    expect(newsThatGotStored).toMatchObject(news);
  });
});

describe("PATCH /", () => {
  let updatedNews;
  let savedNews;
  let idOfSavedNews;

  beforeAll(async () => {
    savedNews = await new News(newsObj).save();
    console.log("saved: ", savedNews._id);
  });
  beforeEach(() => {
    updatedNews = { ...newsObj, heading: "updated heading" };
    idOfSavedNews = savedNews._id.toString(); //such that if in a particular test the id is changed to mock an invalid id, in next test it is returned back to a valid one
  });
  afterAll(async () => await News.deleteMany({}));

  const execute = () =>
    agent.patch(`/api/news/${idOfSavedNews}`).send(updatedNews);

  it("should return 400 if invalid info sent", async () => {
    updatedNews = { heading: "1234567890_1234567890_too_long" };

    const res = await execute();

    expect(res.status).toBe(400);
    expect(res.text).toMatch(new RegExp("Validation failed at server"));
  });

  it("should return 404 if wrong id passed in url param", async () => {
    idOfSavedNews = new mongoose.Types.ObjectId().toHexString();

    const res = await execute();

    expect(res.status).toBe(404);
    expect(res.text).toMatch(/No news document found with given id.../);
  });

  it("should return the modified news document", async () => {
    const res = await execute();

    const newsDocinDB = await News.findOne();

    expect(res.status).toBe(200);
    expect(res._body).toMatchObject(updatedNews);
    expect(newsDocinDB).toMatchObject(updatedNews);
  });
});

afterAll(async () => {
  await Admin.deleteMany({});
  await mongoose.connection.close();
});
