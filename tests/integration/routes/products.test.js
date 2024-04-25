const request = require("supertest");
const app = require("../../../index");
const mongoose = require("mongoose");
const { Product } = require("../../../models/product");
const { Admin } = require("../../../models/admin");
const agentWithApprovedCookie = require("./agentWithApprovedCookie.test");

jest.mock("../../../startup/logger"); //being used at index.js

const productObj = {
  name: "123", //using minLenghts
  fullName: "123",
  qtyEachUnit: "12",
  pack: 3,
  price: 1000,
  category: "Medical",
  offer: 500,
};
Object.freeze(productObj); //to prevent accidental modification

let agent;

beforeAll(async () => (agent = await agentWithApprovedCookie));

describe("GET /", () => {
  beforeAll(async () => {
    await new Product(productObj).save();
  });

  afterAll(async () => {
    await Product.deleteMany({});
  });

  const execute = () => {
    return agent.get("/api/products"); //the http-only cookie is automatically sent
  };

  it("should return the saved products", async () => {
    const res = await execute();

    expect(res.status).toBe(200);
    expect(res.body[0]).toMatchObject(productObj);
  });
});

describe("POST /", () => {
  let product;
  beforeEach(() => (product = productObj));
  afterEach(async () => await Product.deleteMany({})); //to clear the db before next test, or else running tests for 2nd time causes errors. Always leave the db clean

  const execute = () => {
    return agent.post("/api/products").send(product);
  };

  it("should return 400 if invalid information posted", async () => {
    product = {
      name: "",
      fullname: "",
      qtyEachUnit: "0",
      pack: 0,
      price: 0,
      category: "",
      offer: 0,
    };

    const res = await execute();

    expect(res.status).toBe(400);
    expect(res.error.text).toMatch(/Invalid product name/); //as custom configured in product.js model
    //find the error msgs in res.error prop, not in res.body when using supertest
  });

  it("should return 400 if product exists", async () => {
    await execute(); //run for first time to save the product and running 2nd time below will cause 'duplicate / already exists' error

    const res = await execute();

    expect(res.status).toBe(400);
    expect(res.error.text).toBe("Product with given fullName exists...");
  });

  it("should save the product if valid information posted", async () => {
    const res = await execute();

    const productSavedInDB = await Product.findOne();

    expect(res.status).toBe(200);
    expect(res.text).toBe(`Saved new product: ${product.name} successfully...`);
    expect(productSavedInDB).toMatchObject(product);
  });
});

describe("PUT /", () => {
  let newProduct;
  let savedProduct;
  let idOfProductToUpdate;

  beforeAll(async () => {
    savedProduct = await new Product(productObj).save();
  });
  afterAll(async () => await Product.deleteMany({}));
  beforeEach(() => {
    newProduct = {
      name: "updated name",
      fullName: "123",
      qtyEachUnit: "500ml",
      pack: 10,
      price: 2000,
      category: "Food",
      offer: 200,
    };
    idOfProductToUpdate = savedProduct._id;
  });

  const execute = () =>
    agent.put(`/api/products/${idOfProductToUpdate}`).send(newProduct);

  it("should return 400 if invalid information", async () => {
    newProduct = { ...newProduct, name: "" }; //causing an error/invalid info with empty name in the new product obj to put

    const res = await execute();

    expect(res.status).toBe(400);
    expect(res.error.text).toMatch(/Validation failed at server/);
  });

  it("should return 404 if wrong id sent in url parameter", async () => {
    idOfProductToUpdate = new mongoose.Types.ObjectId().toHexString();

    const res = await execute();

    expect(res.status).toBe(404);
    expect(res.error.text).toBe("No product found with given id...");
  });

  it("should return the updated/replaced product", async () => {
    const res = await execute();

    const newProductInDB = await Product.findOne();
    const stringId = newProductInDB._id.toHexString();

    expect(res.status).toBe(200);
    expect(res._body).toMatchObject(newProduct); //confirming if the same object sent is saved in db
    expect(res._body._id).toBe(stringId); //confirming if the object returned is the one saved in db
    expect(res._body.name).toBe(newProductInDB.name);
    expect(res._body.price).toBe(newProductInDB.price);
  });
});

describe("PATCH /", () => {
  let updatedProduct;
  let idOfProductToUpdate;
  let savedProduct;

  beforeAll(async () => {
    savedProduct = await new Product(productObj).save();
  });
  beforeEach(() => {
    updatedProduct = { ...productObj, price: 3000 };
    idOfProductToUpdate = savedProduct._id;
  });
  afterAll(async () => await Product.deleteMany({}));

  const execute = () =>
    agent.patch(`/api/products/${idOfProductToUpdate}`).send(updatedProduct);

  it("should return 400 if invalid info sent", async () => {
    updatedProduct = { ...updatedProduct, price: 0 };

    const res = await execute();

    expect(res.status).toBe(400);
    expect(res.text).toMatch(new RegExp("Validation failed at server"));
  });

  it("should return 404 if wrong id sent in url parameter", async () => {
    idOfProductToUpdate = new mongoose.Types.ObjectId().toHexString();

    const res = await execute();

    expect(res.status).toBe(404);
    expect(res.error.text).toBe("No product found with given id...");
  });

  it("should return the updated product", async () => {
    const res = await execute();

    const updatedProductInDB = await Product.findOne();

    expect(res.status).toBe(200);
    expect(res._body.price).toBe(3000);
    expect(updatedProductInDB.price).toBe(3000);
  });
});

afterAll(async () => {
  await Admin.deleteMany({});
  await mongoose.connection.close();
  //The other servers initiated by supertest are closed by it
});
