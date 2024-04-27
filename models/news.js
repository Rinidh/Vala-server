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
    imageUrl: {
      type: String,
      minLength: 5,
      validate: {
        validator: function (imgUrl) {
          const urlRegex = /^(http|https):\/\/[^\s]+/;
          return urlRegex.test(imgUrl);
        },
      },
    },
    date: {
      type: Date,
      default: Date.now,
    },
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

const validateNewsPatchReq = (newsObj) => {
  const schema = Joi.object({
    heading: Joi.string().min(1).max(20),
    info: Joi.string().min(5).max(1000),
    imageUrl: Joi.string(),
  });

  return schema.validate(newsObj);
};

module.exports = { validateNews, News, validateNewsPatchReq };
