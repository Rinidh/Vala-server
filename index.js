const express = require("express");
require("express-async-errors"); //just need to require this module and it works. For this to work, you must have defined the app.use(error)
require("dotenv").config(); //loads the .env file

const app = express();

// startup loading of required features
const { logger } = require("./startup/logger");
require("./startup/db")();
require("./startup/joi")();
require("./startup/routes");
require("./startup/prod")(app);

console.log(process.env.NODE_ENV);
throw new Error("an_err"); //demo for logger

//the service:
// const port = process.env.PORT || 3000;
// app.listen(port, () =>
//   logger.info(`Listening on port ${port}`, { someMeta: "someMeta..." })
// );
