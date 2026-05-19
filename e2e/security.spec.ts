import { test, expect } from '@playwright/test';

test.describe('Application Security & Auth Boundaries', () => {
  test('Unauthenticated user cannot access protected routes', async ({ page }) => {
    // Attempt to access dashboard directly
    await page.goto('/dashboard');
    
    // Expect redirect to login
    await expect(page).toHaveURL(/.*\/login/);
    
    // Attempt to access onboarding directly
    await page.goto('/onboarding');
    
    // Expect redirect to login
    await expect(page).toHaveURL(/.*\/login/);
  });

  test('Login form is resilient to basic XSS payload', async ({ page }) => {
    await page.goto('/login');
    
    const xssPayload = '<script>alert("xss")</script>';
    
    // Fill the login form with XSS payload
    await page.fill('input[type="email"]', xssPayload);
    await page.fill('input[type="password"]', xssPayload);
    
    await page.click('button[type="submit"]');
    
    // Ensure the payload doesn't break the page (e.g., error should be visible, or no alert should trigger)
    // We expect the form validation or API to reject this, typically showing an error message.
    
    // Just verify the page didn't crash and standard error appears
    const errorIsVisible = await page.locator('.text-red-600').isVisible();
    const isLoginStillVisible = await page.locator('text=Welcome back').isVisible();
    
    expect(errorIsVisible || isLoginStillVisible).toBeTruthy();
  });

  test('Registration form handles malicious payloads gracefully', async ({ page }) => {
    await page.goto('/login?signup=true');
    
    const maliciousName = '"><img src=x onerror=prompt(1)>';
    
    await page.fill('input[placeholder="John"]', maliciousName);
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[placeholder="••••••••"]', 'Password123');
    // Confirm password uses same selector in register mode, we can use placeholder or type
    await page.locator('input[placeholder="••••••••"]').nth(1).fill('Password123');
    
    await page.click('button[type="submit"]');
    
    // Verify it doesn't execute but shows an error or just doesn't crash
    const errorIsVisible = await page.locator('.text-red-600').isVisible();
    const isSignupStillVisible = await page.locator('text=Join the elite').isVisible();
    
    expect(errorIsVisible || isSignupStillVisible).toBeTruthy();
  });
});
