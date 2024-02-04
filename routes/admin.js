const express = require("express");
const _ = require("lodash");
const brcypt = require("bcrypt");
const { Admin, validateAdmin } = require("../models/admin");
const auth = require("../middleware/authorize");

const router = express.Router();

router.get("/", auth, async (req, res) => {
  res.send(await Admin.find());
});

router.post("/", async (req, res) => {
  const { error } = validateAdmin(req.body);
  if (error) {
    return res.status(400).send(error.details[0].message);
  }

  if (await Admin.findOne({ email: req.body.email }))
    return res
      .status(400)
      .send(`Admin with email ${req.body.email} already exists...`);

  const newAdmin = new Admin(_.pick(req.body, ["name", "email", "password"]));

  newAdmin.isApproved = true;

  const salt = await brcypt.genSalt(10);
  newAdmin.password = await brcypt.hash(newAdmin.password, salt);

  await newAdmin.save();

  const token = newAdmin.generateAuthToken();

  res
    .status(200)
    .cookie("authToken", token, { httpOnly: true }) // set secure: true after implementing httpS
    .send({
      message: "Saved admin request. Please wait for approval...",
      adminInfo: _.pick(newAdmin, ["_id", "name", "email"]),
    });
});

module.exports = router;
