const express = require("express");
const { Review, validateReview } = require("../models/review");
const { Email } = require("../models/email");

const router = express.Router();

router.get("/", async (req, res) => {
  res.send(await Review.find());
});

router.post("/", async (req, res) => {
  const { error } = validateReview(req.body);
  if (error) {
    return res
      .status(400)
      .send(`Validation failed at server:, ${error.details[0].message}`);
  }

  const newReview = new Review({
    name: req.body.name,
    review: req.body.review,
    email: { emailId: req.body.emailId },
  });
  await newReview.save();

  const newEmail = new Email({ emailId: req.body.emailId });
  await newEmail.save();

  res.status(200).send("Saved the review...");
});

module.exports = router;
