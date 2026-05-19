import { expect } from "@playwright/test";
import { authedTest as test } from "./fixtures/auth";
import { UsageResponseSchema } from "./schemas";

test("GET /api/user/usage returns a contract-conformant usage object", async ({
  authedRequest,
}) => {
  const res = await authedRequest.get("/api/user/usage");
  expect(res.status()).toBe(200);

  const parsed = UsageResponseSchema.safeParse(await res.json());
  if (!parsed.success) {
    throw new Error(
      `Schema drift on /api/user/usage:\n${JSON.stringify(parsed.error.issues, null, 2)}`,
    );
  }
});
