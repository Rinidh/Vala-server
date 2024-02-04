const authorize = require("../middleware/authorize");
const { Admin } = require("../models/admin");

const router = require("express").Router();

router.post("/", authorize, async (req, res) => {
  const admin = await Admin.findById(req.adminObj._id);

  res.status(200).send(admin);

  console.log(admin);
});

module.exports = router;
