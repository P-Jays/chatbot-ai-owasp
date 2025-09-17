import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

describe("Env validation (happy path only)", () => {
  const OLD_ENV = process.env;

  beforeEach(() => {
    process.env = { ...OLD_ENV };
  });

  afterEach(() => {
    process.env = OLD_ENV;
  });

  it("loads correctly when GEMINI_API_KEY is present", async () => {
    process.env.GEMINI_API_KEY = "1234567890abcdef"; // a valid key
    vi.resetModules(); // ensure fresh import

    const { loadEnv } = await import("../src/utils/env");
    const env = loadEnv();

    expect(env.GEMINI_API_KEY).toBe("1234567890abcdef");
    expect(env.NODE_ENV).toBeDefined(); // also check defaults if you want
  });
});
