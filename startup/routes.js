const express = require("express");
const error = require("../middleware/error");
const products = require("../routes/products");
const reviews = require("../routes/reviews");
const news = require("../routes/news");
const emails = require("../routes/emails");
const admins = require("../routes/admins");
const auth = require("../routes/auth");

module.exports = function (app) {
  app.use(express.json());
  app.use("/api/products", products);
  app.use("/api/reviews", reviews);
  app.use("/api/news", news);
  app.use("/api/emails", emails);
  app.use("/api/admins", admins);
  app.use("/api/auth", auth);

  app.use(error);
};
