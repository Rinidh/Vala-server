const Joi = require("joi");
const bcrypt = require("bcrypt");
const _ = require("lodash");
const authorize = require("../middleware/authorize");
const { Admin } = require("../models/admin");

const router = require("express").Router();

//runs when default logging in; done automatically when accessing the Admin page
router.post("/", authorize, async (req, res) => {
  const admin = await Admin.findById(req.adminObj._id);

  res.status(200).send(_.pick(admin, ["name", "email", "_id"]));
});

//is accessed on manual logging in
router.post("/login", async (req, res) => {
  const { error } = validateLogin(req.body);
  if (error) return res.send("Invalid information...").status(400);

  let admin;
  //req.body.name_or_email may contain an email or a name
  if (req.body.name_or_email.includes("@")) {
    admin = await Admin.findOne({ email: req.body.name_or_email });
  } else {
    admin = await Admin.findOne({ name: req.body.name_or_email });
  }

  if (!admin) return res.status(400).send("Invalid name or password...");

  const isValid = await bcrypt.compare(req.body.password, admin.password);
  if (!isValid) return res.status(400).send("Invalid password...");

  const token = admin.generateAuthToken();

  res
    .status(200)
    .send(_.pick(admin, ["name", "email", "_id"]))
    .cookie("authToken", token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 10,
    }); // set secure: true afterwards
});

module.exports = router;

const validateLogin = (loginObj) => {
  const schema = Joi.object({
    name_or_email: Joi.string().max(50).required(),
    password: Joi.string().min(3).max(50).required(),
  });

  return schema.validate(loginObj);
};
