const express = require("express");
const _ = require("lodash");
const brcypt = require("bcrypt");
const { Admin, validateAdmin } = require("../models/admin");
const auth = require("../middleware/authorize");
const validateObjectId = require("../middleware/validateObjectId");

const router = express.Router();

router.get("/", auth, async (req, res) => {
  if (req.query.isApproved === "true") {
    const approvedAdmins = await Admin.find({ isApproved: true });
    const resBodyWithApprovedAdmins = approvedAdmins.map((admin) => ({
      _id: admin._id,
      emailId: admin.email.emailId,
      name: admin.name,
    }));

    res.send(resBodyWithApprovedAdmins);
  }

  const allAdmins = await Admin.find();
  const resBodyWithAllAdmins = allAdmins.map((admin) => ({
    _id: admin._id,
    emailId: admin.email.emailId,
    name: admin.name,
  }));

  res.send(resBodyWithAllAdmins);
});

router.post("/", async (req, res) => {
  const { error } = validateAdmin(req.body);
  if (error) {
    return res
      .status(400)
      .send(`Validation failed at server:, ${error.details[0].message}`);
  }

  const alreadyExisting = await Admin.findOne({
    "email.emailId": req.body.emailId,
  });
  if (alreadyExisting)
    return res
      .status(400)
      .send(`Admin with email ${req.body.emailId} already exists...`);

  const newAdmin = new Admin({
    email: { emailId: req.body.emailId },
    ..._.pick(req.body, ["name", "password"]),
  });

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

//the patch method here only supports ability to modify the isApproved field ie approve a certain admin request at db. Other fields eg name are currently unchangeable once registered
router.patch("/:id", [auth, validateObjectId], async (req, res) => {
  // try {
  const updatedAdmin = await Admin.findByIdAndUpdate(
    req.params.id,
    { isApproved: true },
    { new: true }
  );

  if (!updatedAdmin) res.status(404).send("No admin found with given id...");

  const resBodyUpdatedAdmin = {
    _id: updatedAdmin._id,
    name: updatedAdmin.name,
    emailId: updatedAdmin.email.emailId,
    isApproved: updatedAdmin.isApproved,
  };
  const token = updatedAdmin.generateAuthToken();
  res
    .cookie("authToken", token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 10,
    })
    .send(resBodyUpdatedAdmin);
  // } catch (error) {
  //   console.error(error);
  // }
});

module.exports = router;
