const express = require("express");
const { Product } = require("../models/product");

const router = express.Router();

router.get("/", async (req, res) => {
  res.send(await Product.find());
});

//add auth when posting/putting products

module.exports = router;
