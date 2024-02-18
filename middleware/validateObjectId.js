const { default: mongoose } = require("mongoose");

function validateObjectId(req, res, next) {
  const isValid = mongoose.Types.ObjectId.isValid(req.body._id);
  if (!isValid) res.status(400).send("Invalid _id...");

  next();
}

module.exports = validateObjectId;
