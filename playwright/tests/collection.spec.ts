import { test, expect } from '@playwright/test';
import { createBoardViaApi, deleteBoardViaApi, resetViaApi, updateBoardViaApi } from './apiHelpers';

let getBoardId;

test.beforeEach(async ({ request }) => {
    await resetViaApi(request);
});

test("Opens a board", async ({ page }) => {
    await page.goto('/');
    await page.click('[data-cy="create-board"]');
    await page.click('[data-cy="new-board-create"]');
    await page.click('[data-cy="create-board"]');
    await page.fill('[data-cy="new-board-input"]', 'New board');
    await page.keyboard.press('Enter');
});

test("Stars a board", async ({ page, request }) => {
    const newBoard = await createBoardViaApi(request, 'New Board');
    const response = await newBoard.json();
    getBoardId = response.id;

    await page.goto('/');

    const boardItems = await page.$$('[data-cy="board-item"]');
    await Promise.all(boardItems.map(async (item) => {
        const visible = await item.isVisible();
        expect(visible).toBeTruthy();
    }));
    await expect(boardItems.length).toBe(1);

    // const boardItems2 = await page.$$('[data-cy="board-item"]');
    // await Promise.all([
    //     ...boardItems2.map(async (item) => {
    //         await item.waitForElementState('visible');
    //     }),
    //     expect(boardItems.length).toBe(1)
    // ]);

    await page.hover('[data-cy="board-item"]');
    await page.click('[class="Star"]');
});

test("Renames a board via api", async ({ page, request, context }) => {
    const newBoard = await createBoardViaApi(request, 'New Board');
    const response = await newBoard.json();
    getBoardId = response.id;

    await page.goto('/');

    const boardItem = await page.waitForSelector('[data-cy="board-item"]');
    const textContent = await boardItem.textContent();
    expect(textContent).toContain('New Board');

    await updateBoardViaApi(request, getBoardId, 'Updated Board');

    const updatedBoardItem = await page.waitForSelector('[data-cy="board-item"]');
    const updatedTextContent = await updatedBoardItem.textContent();
    expect(updatedTextContent).toContain('Updated Board');
});


test("Deletes board via api", async ({ page, request }) => {
    const newBoard = await createBoardViaApi(request, 'New Board');
    const response = await newBoard.json();
    getBoardId = response.id;

    await page.goto('/');

    const boardItems = await page.$$('[data-cy="board-item"]');
    await Promise.all(boardItems.map(async (item) => {
        const visible = await item.isVisible();
        expect(visible).toBeTruthy();
    }));
    await expect(boardItems.length).toBe(1);

    await deleteBoardViaApi(request, getBoardId);

    const boardItems2 = await page.$$('[data-cy="board-item"]');
    await expect(boardItems2.length).toBe(0);
});


test("Shows an error when network does not work on creating board", async ({ page }) => {
    page.route('**/api/boards', (route) => {
        route.abort();
    });
      
    await page.goto(`/`);

    await page.click('[data-cy=create-board]');

    await page.fill('[data-cy=new-board-input]', 'New Board');
    await page.keyboard.press('Enter');

    await page.waitForSelector('[id="errorMessage"]', { state: 'visible', timeout: 5000 });
    await page.waitForSelector('[id="errorMessage"]', { state: 'hidden', timeout: 5000 });
});
