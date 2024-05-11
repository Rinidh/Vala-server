const Joi = require("joi");
const addMongoIdValidatorToJoi = require("../../../startup/joi");

jest.mock("joi");

describe("Add the mongo-objectId validation-function to Joi (joi.js)", () => {
  it("should add the '.objectId' method to Joi", () => {
    addMongoIdValidatorToJoi();

    expect(Joi.objectId).toBeInstanceOf(Function);
  });
  //tests verfifying if the function added validates well or not is supposed to be tested at the library of joi-objectid
});
