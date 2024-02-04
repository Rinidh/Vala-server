const config = require("config");
const logger = require("../startup/logger");
const jwt = require("jsonwebtoken");

function authorize(req, res, next) {
  const token = req.cookies.authToken; //extract the jwt token
  if (!token) return res.status(400).send("No token provided...");

  try {
    const adminObj = jwt.verify(token, config.get("jwtPrivateKey"));

    if (!adminObj.isApproved)
      return res.status(401).send("You are not yet approved...");

    req.adminObj = adminObj;
    next();
  } catch (error) {
    logger.error("Login failed (invalid token)", error);
    res.status(401).send("Invalid token...");
  }
}

module.exports = authorize;
