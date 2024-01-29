const Joi = require("joi");
const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    minLength: 3,
    maxLength: 10,
    required: true,
  },
  fullName: {
    type: String,
    minLength: 3,
    maxLength: 50,
    unique: true,
    required: true,
  },
  qtyEachUnit: {
    type: String,
    minLength: 3,
    maxLength: 10,
    required: true,
  },
  pack: {
    type: Number, //if any field eg pack is not defined, is null by default. Hence no need to pass type: Number | null
    min: 3,
    max: 50,
    required: true,
  },
  price: {
    type: Number,
    min: 1_000,
    required: true,
  },
});

const Product = mongoose.model("product", productSchema);

const validateProduct = (productObj) => {
  const schema = Joi.object({
    name: Joi.string().max(10).min(3).required(),
    fullName: Joi.string().max(50).min(3).required(),
    qtyEachUnit: Joi.string().max(10).min(3).required(),
    pack: Joi.number().min(3).max(50).required(),
    price: Joi.number().min(1_000).required(),
  });

  return schema.validate(productObj);
};

module.exports = { Product, validateProduct };
