const Joi = require("joi");
const { default: mongoose } = require("mongoose");

const News = mongoose.model(
  "news",
  new mongoose.Schema({
    heading: {
      type: String,
      minLength: 1,
      maxLength: 20,
      required: true,
    },
    info: {
      type: String,
      minLength: 5,
      maxLength: 1_000,
      required: true,
    },
    imageUrl: String,
  })
);

const validateNews = (newsObj) => {
  const schema = Joi.object({
    heading: Joi.string().min(1).max(20).required(),
    info: Joi.string().min(5).max(1000).required(),
    imageUrl: Joi.string(),
  });

  return schema.validate(newsObj);
};

module.exports = { validateNews, News };
