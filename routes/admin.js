const express = require("express");
const _ = require("lodash");
const brcypt = require("bcrypt");
const { Admin, validateAdmin } = require("../models/admin");
const auth = require("../middleware/authorize");

const router = express.Router();

router.get("/", auth, async (req, res) => {
  if (req.query.isApproved === "true") {
    const approvedAdmins = await Admin.find({ isApproved: true });
    res.send(_.pick(approvedAdmins, ["_id", "name", "emailId"]));
  }

  res.send(await Admin.find());
});

router.post("/", async (req, res) => {
  const { error } = validateAdmin(req.body);
  if (error) {
    return res
      .status(400)
      .send(`Validation failed at server:, ${error.details[0].message}`);
  }

  if (await Admin.findOne({ "email.emailId": req.body.emailId }))
    return res
      .status(400)
      .send(`Admin with email ${req.body.emailId} already exists...`);

  const newAdmin = new Admin({
    email: { emailId: req.body.emailId },
    ..._.pick(req.body, ["name", "password"]),
  });

  newAdmin.isApproved = true; ///

  const salt = await brcypt.genSalt(10);
  newAdmin.password = await brcypt.hash(newAdmin.password, salt);

  await newAdmin.save();

  const token = newAdmin.generateAuthToken();

  res
    .status(200)
    .cookie("authToken", token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 10,
    }) // set secure: true after implementing httpS
    .send("Saved admin request...");
});

module.exports = router;
