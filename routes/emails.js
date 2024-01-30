const express = require("express");
const { Email, validateEmail } = require("../models/email");

const router = express.Router();

router.get("/", async (req, res) => {
  res.send(await Email.find());
});

router.post("/", async (req, res) => {
  const { error } = validateEmail(req.body.email);
  if (error) {
    return res.status(400).send(error.details[0].message);
  }

  const newEmail = new Email({ email: req.body.email });
  await newEmail.save();

  res.status(200).send("Saved the email id...");
});

module.exports = router;
