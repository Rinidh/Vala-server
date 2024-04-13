const Joi = require("joi");
const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    minLength: 3,
    maxLength: 20,
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
    //eg 500ml
    type: String,
    minLength: 2,
    maxLength: 10,
    required: true,
  },
  pack: {
    //eg 12 bottles in a carton
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
  category: {
    type: String,
    minLength: 3,
    maxLength: 20,
  },
  offer: Number,
});

const Product = mongoose.model("product", productSchema);

const validateProduct = (productObj) => {
  const schema = Joi.object({
    name: Joi.string().max(20).min(3).required().label("Invalid product name"),
    fullName: Joi.string().max(50).min(2).required(),
    qtyEachUnit: Joi.string().max(10).min(2).required(),
    pack: Joi.number().min(3).max(50).required(),
    price: Joi.number().min(1_000).required(),
    category: Joi.string().max(20).min(3),
    offer: Joi.number(),
  });

  return schema.validate(productObj);
};

//this validator func is same as abve but without .require(). req bodies that come in patch reqs usually don't have all the fields and values but only contain the field to update with and its new value
const validateProductPatchReq = (productObj) => {
  const schema = Joi.object({
    name: Joi.string().max(20).min(3).label("Invalid product name"),
    fullName: Joi.string().max(50).min(2),
    qtyEachUnit: Joi.string().max(10).min(2),
    pack: Joi.number().min(3).max(50),
    price: Joi.number().min(1_000),
    category: Joi.string().max(20).min(3),
    offer: Joi.number(),
  });

  return schema.validate(productObj);
};

module.exports = { Product, validateProduct, validateProductPatchReq };
