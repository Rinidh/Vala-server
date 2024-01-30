const express = require("express");
const { News, validateNews } = require("../models/news");
const auth = require("../middleware/authorize");

const router = express.Router();

router.get("/", async (req, res) => {
  res.send(await News.find());
});

router.post("/", auth, async (req, res) => {
  const { error } = validateNews(req.body);
  if (error) {
    return res.status(400).send(error.details[0].message);
  }

  const newNews = new News({
    heading: req.body.heading,
    info: req.body.info,
    imageUrl: req.body.imageUrl,
  });
  await newNews.save();

  res.status(200).send("Saved the news post...");
});

module.exports = router;
