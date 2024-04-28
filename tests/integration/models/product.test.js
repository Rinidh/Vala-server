const { default: mongoose } = require("mongoose");
const connectToDB = require("../../../startup/db");
const {
  Product,
  validateProduct,
  validateProductPatchReq,
} = require("../../../models/product");

jest.mock("../../../startup/logger");

describe("Product model", () => {
  const validProductData = {
    name: "Sample Product",
    fullName: "Sample Product 500ml",
    qtyEachUnit: "500ml",
    pack: 10,
    price: 1500,
    category: "Medical",
  };

  beforeAll(async () => await connectToDB());
  afterEach(async () => await Product.deleteMany({}));

  describe("Model/document creation", () => {
    afterEach(() => jest.restoreAllMocks());

    it("should create a product document if valid data", () => {
      const newProduct = new Product(validProductData);
      expect(newProduct).toMatchObject(validProductData);
    });

    it("should save the document in the DB upon calling .save()", async () => {
      const newProduct = new Product(validProductData);
      const productInDB = await newProduct.save();
      expect(async () => await newProduct.save()).not.toThrow();
      expect(productInDB).toMatchObject(validProductData);
    });

    it("should throw an exception if invalid data", async () => {
      const invalidProductData = { ...validProductData, price: -100 };
      try {
        await new Product(invalidProductData).save();
      } catch (err) {
        expect(err.message).toMatch(/validation failed/);
      }
    });
  });

  describe("validateProduct()", () => {
    it("should succeed validation for valid information", () => {
      const { error } = validateProduct(validProductData);
      expect(error).toBeUndefined();
    });

    it("should fail validation for invalid information", () => {
      const { error } = validateProduct({ ...validProductData, name: "ab" });
      expect(error.details[0].message).toMatch(
        "length must be at least 3 characters long"
      );
    });
  });

  describe("validateProductPatchReq()", () => {
    it("should succeed validation for valid information", () => {
      const { error } = validateProductPatchReq({ name: "New Product Name" });
      expect(error).toBeUndefined();
    });

    it("should fail validation for invalid information", () => {
      const { error } = validateProductPatchReq({ name: "ab" });
      expect(error.details[0].message).toMatch(
        "length must be at least 3 characters long"
      );
    });
  });

  afterAll(async () => await mongoose.connection.close());
});
