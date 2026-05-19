import { expect } from "@playwright/test";
import { authedTest as test } from "./fixtures/auth";
import {
  TrackedJobsResponseSchema,
  ErrorResponseSchema,
} from "./schemas";

test("GET /api/jobs/tracked returns a contract-conformant jobs list", async ({
  authedRequest,
}) => {
  const res = await authedRequest.get("/api/jobs/tracked");
  expect(res.status()).toBe(200);

  const parsed = TrackedJobsResponseSchema.safeParse(await res.json());
  if (!parsed.success) {
    throw new Error(
      `Schema drift on /api/jobs/tracked:\n${JSON.stringify(parsed.error.issues, null, 2)}`,
    );
  }
});

test("POST /api/jobs/update-status rejects empty body with 400", async ({
  authedRequest,
}) => {
  const res = await authedRequest.post("/api/jobs/update-status", { data: {} });
  expect(res.status()).toBe(400);
  ErrorResponseSchema.parse(await res.json());
});

test("POST /api/jobs/update-status rejects invalid status enum with 400", async ({
  authedRequest,
}) => {
  const res = await authedRequest.post("/api/jobs/update-status", {
    data: { title: "QA Engineer", company: "Acme", status: "NOT_A_STATUS" },
  });
  expect(res.status()).toBe(400);
  ErrorResponseSchema.parse(await res.json());
});
