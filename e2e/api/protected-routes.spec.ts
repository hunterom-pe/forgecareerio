import { test, expect } from "@playwright/test";
import { ErrorResponseSchema } from "./schemas";

/**
 * Sweep: every protected route should respond 401 to an unauthenticated request
 * and return the standard { error: string } shape. This catches regressions
 * where a route accidentally drops its session check.
 */
const PROTECTED_ROUTES: Array<{
  path: string;
  method: "GET" | "POST";
  body?: unknown;
}> = [
  { path: "/api/user/usage", method: "GET" },
  { path: "/api/user/resume/view", method: "GET" },
  { path: "/api/jobs/tracked", method: "GET" },
  { path: "/api/jobs/intelligence", method: "GET" },
  { path: "/api/user/onboard", method: "POST", body: {} },
  { path: "/api/user/update-password", method: "POST", body: {} },
  { path: "/api/jobs/update-status", method: "POST", body: {} },
  { path: "/api/jobs/reset", method: "POST", body: {} },
  { path: "/api/jobs/search", method: "POST", body: {} },
  { path: "/api/jobs/interview-brief", method: "POST", body: {} },
  { path: "/api/jobs/follow-up", method: "POST", body: {} },
  { path: "/api/jobs/negotiation-playbook", method: "POST", body: {} },
];

for (const route of PROTECTED_ROUTES) {
  test(`${route.method} ${route.path} → 401 when unauthenticated`, async ({
    request,
  }) => {
    const res =
      route.method === "GET"
        ? await request.get(route.path)
        : await request.post(route.path, { data: route.body });

    expect(
      res.status(),
      `Expected 401 from ${route.method} ${route.path}, got ${res.status()}`,
    ).toBe(401);

    // Best-effort: most routes return JSON {error}, but some may return empty.
    const text = await res.text();
    if (text.trim().startsWith("{")) {
      ErrorResponseSchema.parse(JSON.parse(text));
    }
  });
}
