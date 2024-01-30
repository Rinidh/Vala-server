const express = require("express");
const { Review, validateReview } = require("../models/review");

const router = express.Router();

router.get("/", async (req, res) => {
  res.send(await Review.find());
});

router.post("/", async (req, res) => {
  const { error } = validateReview(req.body);
  if (error) {
    return res.status(400).send("Bad review post...");
  }

  const newReview = new Review({
    name: req.body.name,
    review: req.body.review,
  });
  await newReview.save();

  res.status(200).send("Saved the review...");
});

module.exports = router;
