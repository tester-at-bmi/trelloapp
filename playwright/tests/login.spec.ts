import { test, expect } from '@playwright/test';
import { resetViaApi, signUpViaApi } from './apiHelpers';

test.beforeEach(async ({ request }) => {
    await resetViaApi(request);
});

test("Signup new user with welcome email", async ({ page }) => {
    await page.route('**/login', (route) => {
        route.continue();
    });

    // Listen for the response event
    let response: any;
    page.on('response', (res) => {
        if (res.request().method() === 'POST') {
            response = res;
        }
    });

    await page.goto('/');

    await page.click('[data-cy="login-menu"]');
    await page.waitForSelector('[data-cy="login-module"]', { state: 'visible', timeout: 2000 });
    await page.click('[data-cy="close-login"]');
    await page.click('[data-cy="login-menu"]');
    await page.getByText('Sign up here').click({ timeout: 2000 });

    await page.fill('[data-cy="signup-email"]', 'patrick@johndoe.com');
    await page.fill('[data-cy="signup-password"]', 'abcd1234');
    await page.check('[data-cy="welcome-email-checkbox"]');
    await page.click('[data-cy="signup"]');
    await Promise.all([
        page.waitForEvent('response'),
        page.waitForLoadState('domcontentloaded', { timeout: 4000 }),
    ]);

    await page.waitForSelector('[data-cy="login-module"]', { state: 'hidden', timeout: 2000 });

    const cookies = await page.context().cookies();
    const trelloTokenCookie = cookies.find((cookie) => cookie.name === 'trello_token');
    expect(trelloTokenCookie).toBeTruthy();

    // Should see a success message currently not being checked.
});

test("Signup user without welcome email", async ({ page }) => {
    await page.route('**/api/users', (route) => {
        route.continue();
    });

    // Listen for the response event
    let response: any;
    page.on('response', (res) => {
        if (res.request().method() === 'GET') {
            response = res;
        }
    });

    await page.goto('/');
    await page.waitForLoadState('domcontentloaded', { timeout: 4000 });
    await page.click('[data-cy="login-menu"]');
    await page.waitForSelector('[data-cy="login-module"]', { state: 'visible', timeout: 2000 });
    await page.getByText('Sign up here').click({ timeout: 2000 });
    await page.fill('[data-cy="signup-email"]', 'patrick@johndoe.com');
    await page.fill('[data-cy="signup-password"]', 'abcd1234');
    await page.click('[data-cy="signup"]');
    await page.waitForSelector('[data-cy="login-module"]', { state: 'hidden', timeout: 2000 });

    await page.waitForLoadState('domcontentloaded', { timeout: 4000 });

    const cookies = await page.context().cookies();
    const trelloTokenCookie = cookies.find((cookie) => cookie.name === 'trello_token');
    expect(trelloTokenCookie).toBeTruthy();
});

test("Signup existing user", async ({ page, request }) => {
    await signUpViaApi(request, 'patrick@johndoe.com', 'abcd1234');
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded', { timeout: 4000 });
    await page.click('[data-cy="login-menu"]');
    await page.waitForSelector('[data-cy="login-module"]', { state: 'visible', timeout: 2000 });
    await page.getByText('Sign up here').click({ timeout: 2000 });
    await page.fill('[data-cy="signup-email"]', 'patrick@johndoe.com');
    await page.fill('[data-cy="signup-password"]', 'abcd1234');
    await page.click('[data-cy="signup"]');
    await page.waitForLoadState('domcontentloaded', { timeout: 4000 });
});

test("Log in existing user", async ({ page, request }) => {
    await page.route('**/api/users', (route) => {
        route.continue();
    });

    // Listen for the response event
    let response: any;
    page.on('response', (res) => {
        if (res.request().method() === 'GET') {
            response = res;
        }
    });

    await signUpViaApi(request, 'patrick@johndoe.com', 'abcd1234');
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded', { timeout: 4000 });
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

    await page.waitForLoadState('domcontentloaded', { timeout: 4000 });

    const cookies = await page.context().cookies();
    const trelloTokenCookie = cookies.find((cookie) => cookie.name === 'trello_token');
    expect(trelloTokenCookie).toBeTruthy();

    await page.click('[data-cy="logged-user"]');
    await page.getByText('Log out').click({ timeout: 2000 });

    const cookiee = await page.context().cookies();
    const trelloTokenCookiee = cookiee.find((c) => c.name === 'trello_token');
    expect(trelloTokenCookiee).toBeFalsy();
});

test("Should handle not existing user", async ({ page, context }) => {
    await page.route('**/api/users', (route) => {
        route.continue();
    });

    // Listen for the response event
    let response: any;
    page.on('response', (res) => {
        if (res.request().method() === 'GET') {
            response = res;
        }
    });

    await context.addCookies([{
        name: 'trello_token',
        value: 'aaa',
        url: 'http://localhost:3000'
    }]);

    await page.goto('/');
    await page.waitForLoadState('domcontentloaded', { timeout: 4000 });

    const cookies = await page.context().cookies();
    const trelloTokenCookie = cookies.find((cookie) => cookie.name === 'trello_token');
    expect(trelloTokenCookie).toBeTruthy();
});