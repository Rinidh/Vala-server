const Joi = require("joi");
const mongoose = require("mongoose");
const { emailRegex } = require("./email");
const jwt = require("jsonwebtoken");
const config = require("config");

const adminSchema = new mongoose.Schema({
  name: {
    type: String,
    minLength: 1,
    maxLength: 50,
    required: true,
    trim: true,
  },
  password: {
    type: String,
    minLength: 3,
    required: true,
  },
  email: {
    type: String,
    require: true,
    trim: true,
    unique: true,
    lowerCase: true,
    match: emailRegex,
  },
  dateWhenAdmin: {
    type: Date,
    default: Date.now,
    get: function (date) {
      //define a getter on "date" field to return readable date whenever accessed
      //in mongodb, prefer storing date as a js Date timestamp
      const dateOpts = { year: "numeric", month: "long", day: "numeric" };
      return date.toLocaleDateString(undefined, dateOpts);
    },
  },
  isApproved: {
    type: Boolean,
    default: false,
  },
});

adminSchema.methods.generateAuthToken = function () {
  const key = config.get("jwtPrivateKey");
  return jwt.sign(
    { _id: this._id, name: this.name, isApproved: this.isApproved },
    key
  );
};

const Admin = mongoose.model("admin", adminSchema);

const validateAdmin = (adminObj) => {
  const schema = Joi.object({
    name: Joi.string().max(50).min(1).required(),
    password: Joi.string().max(50).min(3).required(),
    email: Joi.string()
      .regex(emailRegex)
      .required()
      .trim()
      .lowercase()
      .label("Email"), // For nicer error messages
  });

  return schema.validate(adminObj);
};

module.exports = { Admin, validateAdmin };
