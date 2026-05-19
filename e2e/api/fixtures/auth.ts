import { test as base, request, APIRequestContext } from "@playwright/test";

/**
 * Sign in via NextAuth Credentials provider and return an APIRequestContext
 * whose cookie jar holds a valid session token.
 *
 * Flow:
 *  1. GET  /api/auth/csrf            -> { csrfToken }
 *  2. POST /api/auth/callback/credentials with csrfToken, email, password, json=true
 *  3. Cookie jar now contains next-auth.session-token (or __Secure-... over HTTPS)
 */
export async function createAuthedRequest(
  baseURL: string,
  email: string,
  password: string,
): Promise<APIRequestContext> {
  const ctx = await request.newContext({ baseURL });

  const csrfRes = await ctx.get("/api/auth/csrf");
  if (!csrfRes.ok()) {
    throw new Error(`CSRF fetch failed: ${csrfRes.status()}`);
  }
  const { csrfToken } = (await csrfRes.json()) as { csrfToken: string };

  const signInRes = await ctx.post("/api/auth/callback/credentials", {
    form: {
      csrfToken,
      email,
      password,
      json: "true",
      callbackUrl: `${baseURL}/`,
    },
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });

  if (!signInRes.ok()) {
    throw new Error(
      `Credentials sign-in failed: ${signInRes.status()} ${await signInRes.text()}`,
    );
  }

  const cookies = await ctx.storageState();
  const hasSession = cookies.cookies.some((c) =>
    c.name.includes("next-auth.session-token"),
  );
  if (!hasSession) {
    throw new Error(
      "Sign-in returned ok but no session cookie was set. Check TEST_USER credentials.",
    );
  }

  return ctx;
}

type AuthedFixtures = {
  authedRequest: APIRequestContext;
};

/**
 * Skips automatically when TEST_USER_EMAIL / TEST_USER_PASSWORD are not set,
 * so the unauthenticated contract checks can still run in CI without secrets.
 */
export const authedTest = base.extend<AuthedFixtures>({
  authedRequest: async ({ baseURL }, use, testInfo) => {
    const email = process.env.TEST_USER_EMAIL;
    const password = process.env.TEST_USER_PASSWORD;

    if (!email || !password) {
      testInfo.skip(
        true,
        "TEST_USER_EMAIL / TEST_USER_PASSWORD not set — skipping authed API contract test.",
      );
    }

    const ctx = await createAuthedRequest(baseURL!, email!, password!);
    await use(ctx);
    await ctx.dispose();
  },
});
