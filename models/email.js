const Joi = require("joi");
const { default: mongoose } = require("mongoose");

//used basic email validation logic
const emailRegex =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

const Email = mongoose.model(
  "email",
  new mongoose.Schema({
    email: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      lowerCase: true,
      match: emailRegex,
      //index: true, //not needed unless this was a 'user' doc
    },
  })
);

const validateEmail = (emailObj) => {
  const emailSchema = Joi.string()
    .regex(emailRegex)
    .required()
    .trim()
    .lowercase()
    .label("Email"); // For nicer error messages

  return emailSchema.validate(emailObj);
};

module.exports = { validateEmail, Email };
