const express = require("express");

//startup loading of required
require("./startup/process-catchers")();
const { logger } = require("./startup/logger");
require("express-async-errors"); //just need to require this module and it works. For this to work, you must have defined the app.use(error)
require("./startup/db")();
require("./startup/joi")();
require("./startup/routes");
require("./startup/prod")();

throw new Error("an_err");

//the service:
const app = express();

const port = process.env.PORT || 3000;
app.listen(port, () =>
  logger.info(`Listening on port ${port}`, { someMeta: "someMeta..." })
);
