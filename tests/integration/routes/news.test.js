const request = require("supertest");
const mongoose = require("mongoose");
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
    console.log(news);
    const res = await execute();
    console.log(res.error.text);

    const newsThatGotStored = await News.findOne();

    expect(res.status).toBe(200);
    expect(res.text).toMatch(/Saved the news post.../);
    expect(newsThatGotStored).toMatchObject(news);
  });
});

afterAll(async () => {
  await Admin.deleteMany({});
  await mongoose.connection.close();
});
