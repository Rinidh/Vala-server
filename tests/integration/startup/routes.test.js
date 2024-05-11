const InitializeRouteHandlers = require("../../../startup/routes");

jest.mock("../../../startup/logger"); //being used in middleware/error.js

describe("Initialize all route handlers", () => {
  let endpointsInitialized = [];
  let middlewaresInitialized = [];
  let handlersInitialized = [];

  const app = {
    use: jest.fn().mockImplementation((endpointOrMiddlware, handler) => {
      if (typeof endpointOrMiddlware === "string")
        endpointsInitialized.push(endpointOrMiddlware);
      if (typeof endpointOrMiddlware === "function")
        middlewaresInitialized.push(endpointOrMiddlware);
      if (handler) handlersInitialized.push(handler);
    }),
  };

  beforeEach(() => app.use.mockClear());

  it("should add all route handlers to app instance", () => {
    InitializeRouteHandlers(app);

    expect(endpointsInitialized).toEqual(
      expect.arrayContaining([
        "/api/products",
        "/api/reviews",
        "/api/news",
        "/api/emails",
        "/api/admins",
        "/api/auth",
      ])
    );

    //we basically test to see if functions have been passed as args
    handlersInitialized.forEach((handler) => {
      expect(handler).toBeInstanceOf(Function);
    });
    middlewaresInitialized.forEach((middleware) => {
      expect(middleware).toBeInstanceOf(Function);
    });
  });
});
