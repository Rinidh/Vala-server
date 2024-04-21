const { default: mongoose } = require("mongoose");

function validateObjectId(req, res, next) {
  const mongoId = req.body?._id //the mongo-id comes as _id field in mongo docs
    ? req.body._id
    : req.params?.id
    ? req.params.id
    : null;

  if (!mongoId) {
    res.status(401).send("No id provided in request body or path parameter...");
  }

  const isValid = mongoose.Types.ObjectId.isValid(mongoId);
  if (!isValid) {
    res.status(400).send("Invalid _id...");
  } else {
    next();
  }
}

module.exports = validateObjectId;
