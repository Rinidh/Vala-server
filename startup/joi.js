const Joi = require("joi");
const a_func = require("joi-objectid")(Joi); //requiring the module returns a func that you can call by passing a ref to the Joi module. The return value is a func that works with Joi to validate a string as an ObjectID of mongodb

module.exports = function () {
  Joi.objectId = a_func; //defining a new meth in Joi obj and setting it to the returned function
};

//note that joi-objectid v4.0.2 has bugs, it doesn't very well work with joi @ 17.11.0; error messages are shown in console when a wrong id is tried validate... Though the required functionality is still met
