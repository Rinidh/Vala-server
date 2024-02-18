const Joi = require("joi");
const { default: mongoose } = require("mongoose");

//used basic email validation logic
const emailRegex =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

const emailSchema = new mongoose.Schema({
  emailId: {
    type: String,
    required: true,
    trim: true,
    unique: true,
    lowerCase: true,
    match: emailRegex,
    //index: true, //not needed unless this was a 'user' doc
  },
  dateRecorded: {
    type: Date,
    default: Date.now,
    get: function (date) {
      const dateOpts = { year: "numeric", month: "long", day: "numeric" };
      return date.toLocaleDateString(undefined, dateOpts);
    },
  },
});

const Email = mongoose.model("email", emailSchema);

const validateEmail = (emailObj) => {
  const emailSchema = Joi.string()
    .regex(emailRegex)
    .required()
    .trim()
    .lowercase()
    .label("Email"); // For nicer error messages

  return emailSchema.validate(emailObj);
};

module.exports = { validateEmail, Email, emailRegex, emailSchema };
