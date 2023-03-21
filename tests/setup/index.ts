import { afterAll, afterEach, beforeAll } from "vitest";

import { server } from "./mock-request";

beforeAll(() => {
  server.listen({ onUnhandledRequest: "error" });
});

afterAll(() => {
  server.close();
});

afterEach(() => {
  server.resetHandlers();
});
