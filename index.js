const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
require("express-async-errors"); //just need to require this module and it works. For this to work, you must have defined the app.use(error)
require("dotenv").config(); //loads the .env file

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
); //for dev only; assign exact domains to allow in prod
app.use(cookieParser()); //extracts cookies in requests into an accessible object and attaches it to req body

// startup loading of required features
require("./startup/error-catchers")();
const logger = require("./startup/logger");
require("./startup/db")();
require("./startup/joi")();
require("./startup/routes")(app);
require("./startup/prod")(app);

//the service
const port = process.env.PORT || 3000;
app.listen(port, () =>
  logger.info(`Listening on port ${port}`, { someMeta: "someMeta..." })
);
