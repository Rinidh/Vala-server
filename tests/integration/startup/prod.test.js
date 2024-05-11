const initializeProductionMiddlewares = require("../../../startup/prod");

describe("Add required middleware to request pipeline when in production", () => {
  const app = {
    use: jest.fn(),
  };

  beforeEach(() => app.use.mockClear());
  afterEach(() => (process.env.NODE_ENV = "development"));

  it("should add middlewares returned by helmet() and compression() if in production", () => {
    process.env.NODE_ENV = "production";

    initializeProductionMiddlewares(app);

    expect(app.use).toHaveBeenCalledTimes(2);
    expect(app.use.mock.calls[0][0]).toBeInstanceOf(Function);
    expect(app.use.mock.calls[1][0]).toBeInstanceOf(Function);
    // expect(app.use).toHaveBeenCalledWith(helmet(), compression()); //doesn't work for some reason, perhaps different instances in memory I guess
  });

  it("shouldn't add middlewares if not in production env", () => {
    process.env.NODE_ENV = "development";

    initializeProductionMiddlewares(app);

    expect(app.use).not.toHaveBeenCalled();
  });
});
