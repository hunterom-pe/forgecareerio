import { test, expect } from "@playwright/test";
import { ErrorResponseSchema } from "./schemas";

test.describe("POST /api/auth/register — input contract", () => {
  test("rejects invalid email with 400", async ({ request }) => {
    const res = await request.post("/api/auth/register", {
      data: { email: "not-an-email", name: "Test", password: "ValidPass123" },
    });
    expect(res.status()).toBe(400);
    expect(() => ErrorResponseSchema.parse(res.json())).not.toThrow();
  });

  test("rejects password missing a digit with 400", async ({ request }) => {
    const res = await request.post("/api/auth/register", {
      data: {
        email: `contract-${Date.now()}@example.test`,
        name: "Test",
        password: "NoDigitsHere",
      },
    });
    expect(res.status()).toBe(400);
    const body = ErrorResponseSchema.parse(await res.json());
    expect(body.error.toLowerCase()).toContain("number");
  });

  test("rejects password shorter than 8 chars with 400", async ({ request }) => {
    const res = await request.post("/api/auth/register", {
      data: { email: `c-${Date.now()}@example.test`, name: "T", password: "Ab1" },
    });
    expect(res.status()).toBe(400);
    ErrorResponseSchema.parse(await res.json());
  });

  test("rejects empty body with 400", async ({ request }) => {
    const res = await request.post("/api/auth/register", { data: {} });
    expect(res.status()).toBe(400);
    ErrorResponseSchema.parse(await res.json());
  });
});
