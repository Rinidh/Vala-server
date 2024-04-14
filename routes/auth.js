const Joi = require("joi");
const bcrypt = require("bcrypt");
const _ = require("lodash");
const authorize = require("../middleware/authorize");
const { Admin } = require("../models/admin");
const validateObjectId = require("../middleware/validateObjectId");

const router = require("express").Router();

//apart from POSTs to this authenticate route, all other post reqs eg in admin, news... respond back with a string

//runs when default logging in; done automatically when accessing the Admin page if logged in before
router.post("/", authorize, async (req, res) => {
  const admin = await Admin.findById(req.adminObj._id);
  const resBody = {
    ..._.pick(admin, ["name", "_id"]),
    emailId: _.get(admin, "email.emailId"), //to access nested props
  };

  res.status(200).send(resBody);
});

//is accessed on manual logging in
router.post("/login", async (req, res) => {
  const { error } = validateLogin(req.body);
  if (error) return res.status(400).send("Invalid information...");

  let admin;
  //req.body.name_or_email may contain an email or a name
  if (req.body.name_or_emailId.includes("@")) {
    admin = await Admin.findOne({ "email.emailId": req.body.name_or_emailId });
  } else {
    admin = await Admin.findOne({ name: req.body.name_or_emailId });
  }

  if (!admin) return res.status(400).send("Invalid name or emailId...");

  const isValid = await bcrypt.compare(req.body.password, admin.password);
  if (!isValid) return res.status(400).send("Invalid password...");

  const token = admin.generateAuthToken();

  const resBody = {
    emailId: _.get(admin, "email.emailId"),
    ..._.pick(admin, ["name", "_id"]),
  };

  res
    .status(200)
    .send(resBody)
    .cookie("authToken", token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 10,
    }); // set secure: true afterwards
});

module.exports = router;

const validateLogin = (loginObj) => {
  const schema = Joi.object({
    name_or_emailId: Joi.string().min(1).max(50).required(),
    password: Joi.string().min(3).max(50).required(),
  });

  return schema.validate(loginObj);
};
