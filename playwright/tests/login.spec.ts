import { test, expect } from '@playwright/test';
import { resetViaApi, signUpViaApi } from './apiHelpers';

test.beforeEach(async ({ request }) => {
    await resetViaApi(request);
});

test.skip("Signup new user with welcome email", async ({ page }) => { });

test("Signup user without welcome email", async ({ page }) => {
    await page.goto('/');

    await page.click('[data-cy="login-menu"]');
    await page.waitForSelector('[data-cy="login-module"]', { state: 'visible', timeout: 2000 });
    await page.getByText('Sign up here').click({ timeout: 2000 });
    await page.fill('[data-cy="signup-email"]', 'patrick@johndoe.com');
    await page.fill('[data-cy="signup-password"]', 'abcd1234');
    await page.click('[data-cy="signup"]');
    await page.waitForSelector('[data-cy="login-module"]', { state: 'hidden', timeout: 2000 });

    const pathname = await page.evaluate(() => window.location.pathname);
    expect(pathname).toBe('/');

    const cookies = await page.context().cookies();
    const trelloTokenCookie = cookies.find((cookie) => cookie.name === 'trello_token');
    expect(trelloTokenCookie).toBeTruthy();
});

test("Signup existing user", async ({ page, request }) => {
    await signUpViaApi(request, 'patrick@johndoe.com', 'abcd1234');
    await page.goto('/');
    await page.click('[data-cy="login-menu"]');
    await page.waitForSelector('[data-cy="login-module"]', { state: 'visible', timeout: 2000 });
    await page.getByText('Sign up here').click({ timeout: 2000 });
    await page.fill('[data-cy="signup-email"]', 'patrick@johndoe.com');
    await page.fill('[data-cy="signup-password"]', 'abcd1234');
    await page.click('[data-cy="signup"]');
});

test("Log in existing user", async ({ page, request }) => {
    await signUpViaApi(request, 'patrick@johndoe.com', 'abcd1234');
    await page.goto('/');
    await page.click('[data-cy="login-menu"]');
    await page.waitForSelector('[data-cy="login-module"]', { state: 'visible', timeout: 5000 });
    await page.fill('[data-cy="login-email"]', 'patrick@johndoe.com');
    await page.fill('[data-cy="login-password"]', 'a');
    await page.click('[data-cy="login"]');
    //should get error?
    await page.fill('[data-cy="login-password"]', '');
    await page.fill('[data-cy="login-password"]', 'abcd1234');
    await page.click('[data-cy="login"]');
    await page.waitForSelector('[data-cy="login-module"]', { state: 'hidden', timeout: 5000 });

    const pathname = await page.evaluate(() => window.location.pathname);
    expect(pathname).toBe('/');

    const cookies = await page.context().cookies();
    const trelloTokenCookie = cookies.find((cookie) => cookie.name === 'trello_token');
    expect(trelloTokenCookie).toBeTruthy();

    await page.click('[data-cy="logged-user"]');
    await page.getByText('Log out').click({ timeout: 2000 });

    const cookiee = await page.context().cookies();
    const trelloTokenCookiee = cookiee.find((c) => c.name === 'trello_token');
    expect(trelloTokenCookiee).toBeFalsy();
});

test.skip("Should handle not existing user", async ({ page, context }) => {

    const responsePromise = page.waitForResponse('**/api/users'); // Replace '**/api/users' with the actual URL pattern for the GET request

    await page.route('**/api/users', (route) => {
        route.continue();
    });

    await context.addCookies([{
        name: 'trello_token',
        value: 'aaa',
        url: 'http://localhost:3000',
        sameSite: 'None',
        secure: false,
    }]);

    await page.goto('/');

    await responsePromise;
});