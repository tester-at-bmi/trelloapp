import { test, expect } from '@playwright/test';
import { resetViaApi } from './apiHelpers';

test.beforeEach(async ({ request }) => {
    await resetViaApi(request);
});

test("Signup new user with welcome email", async ({ page }) => {

});

test("Signup user without welcome email", async ({ page }) => {
 
});

test("Signup existing user", async ({ page }) => {

});

test("Log in existing user", async ({ page }) => {

});

test("Should handle not existing user", async ({ page }) => {

});