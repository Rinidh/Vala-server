const Joi = require("joi");
const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
  name: {
    type: String,
    minLength: 3,
    maxLength: 10,
    required: true,
  },
  review: {
    type: String,
    minLength: 1,
    maxLength: 1_000,
    required: true,
  },
});

const Review = mongoose.model("review", reviewSchema);

const validateReview = (productObj) => {
  const schema = Joi.object({
    name: Joi.string().max(10).min(3).required(),
    review: Joi.string().max(1000).min(1).required(),
  });

  return schema.validate(productObj);
};

module.exports = { Review, validateReview };
