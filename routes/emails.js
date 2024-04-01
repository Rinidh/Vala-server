const express = require("express");
const { Email, validateEmail } = require("../models/email");
const auth = require("../middleware/authorize");

const router = express.Router();

router.get("/", auth, async (req, res) => {
  res.send(await Email.find());
});

router.post("/", async (req, res) => {
  const { error } = validateEmail(req.body.emailId);
  if (error) {
    return res.status(400).send(error.details[0].message);
  }

  const emailExists = await Email.findOne({ emailId: req.body.emailId }); //better to use findOne instead of find() as latter returns an array always truthy
  if (emailExists) return res.status(400).send("Email already exists...");

  const newEmail = new Email({ emailId: req.body.emailId });
  await newEmail.save();

  res.status(200).send("Saved the email id...");
});

module.exports = router;
