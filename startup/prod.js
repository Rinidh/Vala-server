// this file contains libs to load when in production env / when running at server

const helmet = require("helmet");
const compression = require("compression");

module.exports = function (app) {
  if (process.env.NODE_ENV === "production") {
    app.use(helmet());
    app.use(compression());
  }
};
