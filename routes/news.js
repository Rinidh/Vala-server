const express = require("express");
const { News, validateNews, validateNewsPatchReq } = require("../models/news");
const auth = require("../middleware/authorize");

const router = express.Router();

router.get("/", async (req, res) => {
  res.send(await News.find());
});

router.post("/", auth, async (req, res) => {
  const { error } = validateNews(req.body);
  if (error) {
    return res
      .status(400)
      .send(`Validation failed at server:, ${error.details[0].message}`);
  }

  const newNews = new News({
    heading: req.body.heading,
    info: req.body.info,
    imageUrl: req.body.imageUrl,
  });
  await newNews.save();

  res.status(200).send("Saved the news post...");
});

router.patch("/:id", async (req, res) => {
  const { error } = validateNewsPatchReq(req.body);
  if (error) {
    return res
      .status(400)
      .send(`Validation failed at server:, ${error.details[0].message}`);
  }

  const updatedNews = await News.findByIdAndUpdate(
    req.params.id,
    { ...req.body },
    { new: true }
  );
  if (!updatedNews)
    return res.status(404).send("No news document found with given id...");

  res.send(updatedNews);
});

module.exports = router;
