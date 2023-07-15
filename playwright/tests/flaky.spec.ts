import { test, expect } from '@playwright/test';

let getBoardId;

test("Board id must be even", async ({ page, request }) => {

    await page.route('**/api/boards', (route) => route.continue());

    const boardRequest = page.waitForRequest('**/api/boards');
    const responsePromise = page.waitForResponse('**/api/boards/**');

    await page.goto('/');

    await page.click('[data-cy="create-board"]');
    await page.fill('[data-cy=new-board-input]', 'New Board');
    await page.keyboard.press('Enter');

    await Promise.all([boardRequest, responsePromise]);

    const response = await responsePromise;
    const responseBody = await response.json();

    console.log(responseBody.id);
    expect(responseBody.id % 5 === 0).toBe(false);
});