const express = require("express");
const _ = require("lodash");
const {
  Product,
  validateProduct,
  validateProductPatchReq,
} = require("../models/product");
const authorize = require("../middleware/authorize");

const router = express.Router();

router.get("/", async (req, res) => {
  res.send(await Product.find());
});

router.post("/", authorize, async (req, res) => {
  const { error } = validateProduct(req.body);
  if (error)
    return res
      .status(400)
      .send(`Validation failed at server:, ${error.details[0].message}`);

  const productExists = await Product.findOne({ fullName: req.body.fullName }); //because 'fullName' is unique for eery product
  if (productExists) {
    res.status(400).send("Product with given fullName exists...");
  }
  const newProduct = new Product(req.body);
  await newProduct.save();

  res.status(200).send(`Saved new product: ${newProduct.name} successfully...`);
});

//usually, the patch route-handler below is most used, even for replacing all product info. The implementation of both handlers is same
router.put("/:id", authorize, async (req, res) => {
  const { error } = validateProduct(req.body);
  if (error) {
    return res
      .status(400)
      .send(`Validation failed at server:, ${error.details[0].message}`);
  }

  const { name, fullName, qtyEachUnit, pack, price, offer, category } =
    req.body;

  //can also use the traditional way of first retrieving, modifying and then saving instead of .findByIdAndUpdate()
  const updatedProduct = await Product.findByIdAndUpdate(
    req.params.id,
    {
      name,
      fullName,
      qtyEachUnit,
      pack,
      price,
      offer,
      category,
    },
    { new: true }
  );

  if (!updatedProduct) {
    res.status(404).send("No product found with given id...");
  }

  res.send(updatedProduct); //as per the http convention to send back the updated resource
});

router.patch("/:id", authorize, async (req, res) => {
  const { error } = validateProductPatchReq(req.body);
  if (error)
    res
      .status(400)
      .send(`Validation failed at server:, ${error.details[0].message}`);

  //the long silly way:
  // for(const fieldToUpdate in req.body) {
  //   await Product.findByIdAndUpdate(req.params.id, { fieldToUpdate: req.body[fieldToUpdate] })
  // }
  // const updatedProduct = Product.findById(req.params.id)
  // res.send(updatedProduct)

  //the better way:
  const updatedProduct = await Product.findByIdAndUpdate(
    req.params.id,
    { ...req.body },
    { new: true }
  );

  if (!updatedProduct) {
    res.status(404).send("No product found with given id...");
  }

  res.send(updatedProduct);
});

module.exports = router;
