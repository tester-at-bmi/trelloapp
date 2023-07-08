import { test, expect } from '@playwright/test';
const clipboardy = require('clipboardy');
import {
    createBoardViaApi,
    createListViaApi,
    createTaskViaApi,
    resetViaApi
} from './apiHelpers'

declare global {
    interface Window {
        getClipboard: () => Promise<string>;
    }
}

async function performDragAndDrop(page: any, sourceSelector: string, targetSelector: string) {
    try {
        let sourceElement = await page.waitForSelector(sourceSelector);
        let targetElement = await page.waitForSelector(targetSelector);

        let sourceBoundingBox = await sourceElement.boundingBox();
        let targetBoundingBox = await targetElement.boundingBox();

        if (!sourceBoundingBox || !targetBoundingBox) {
            throw new Error('Failed to retrieve element bounding boxes');
        }

        let sourceX = sourceBoundingBox.x + sourceBoundingBox.width / 2;
        let sourceY = sourceBoundingBox.y + sourceBoundingBox.height / 2;

        let targetX = targetBoundingBox.x + targetBoundingBox.width / 2;
        let targetY = targetBoundingBox.y + targetBoundingBox.height / 2;

        await page.mouse.move(sourceX, sourceY);
        await page.mouse.down();

        await page.mouse.move(targetX, targetY);
        await page.mouse.up();

    } catch (error) {
        console.error("Error occurred during performDragAndDrop:", error);
        throw error; // Rethrow the error to propagate it to the calling code
    }
}

let getBoardId;
let getListId;

test.beforeEach(async ({ request, page }) => {
    await resetViaApi(request);
    const newBoard = await createBoardViaApi(request, 'New Board');
    const response = await newBoard.json();
    getBoardId = response.id;

    await page.exposeBinding('getClipboard', async () => {
        const clipboard = await clipboardy.readSync();
        return clipboard;
    });
});

test('Adds a new list', async ({ page }) => {
    // Visit board page.
    await page.goto(`/board/${getBoardId}`);

    // Start typing and cancel.
    await page.click('[data-cy=add-list]');
    await page.waitForSelector('[data-cy=add-list-options]', { state: 'visible', timeout: 2000 });
    await page.click('[data-cy=cancel]');
    await page.waitForSelector('[data-cy=add-list-options]', { state: 'hidden', timeout: 2000 });

    // Type empty name of list.
    await page.click('[data-cy=add-list]');
    await page.click('[data-cy=save]');
    await page.waitForSelector('[data-cy=add-list-options]', { state: 'hidden', timeout: 2000 });

    // Create a new list.
    await page.click('[data-cy=add-list]');
    await page.fill('[data-cy=add-list-input]', 'New List');
    await page.keyboard.press('Enter');
    await page.waitForSelector('[data-cy=list]', { state: 'visible', timeout: 2000 });

    // Update list name.
    await page.fill('[data-cy=list-name]', '');
    await page.fill('[data-cy=list-name]', 'Renamed List');
    await page.keyboard.press('Enter');
    await page.click('[data-cy=list] .dropdown');
    await page.click('[data-cy="copy-list-properties"]');
    const clipboardContent = await page.evaluate(() => window.getClipboard());
    expect(clipboardContent).toContain('title');
    expect(clipboardContent).toContain('id');
    expect(clipboardContent).toContain('created');
    expect(clipboardContent).toContain('boardId');
    await page.locator('span').getByText('Delete list').first().click({ timeout: 2000 });
    await page.waitForSelector('[data-cy=list]', { state: 'hidden', timeout: 2000 });
});

test('Adds, updates, checks, and deletes a task', async ({ page, request }) => {
    await createListViaApi(request, getBoardId, 'New List');

    await page.goto(`/board/${getBoardId}`);

    await page.click('[data-cy="new-task"]');

    await page.waitForSelector('[data-cy="task-options"]', { state: 'visible', timeout: 2000 });

    await page.click('[data-cy="add-task"]');

    await page.waitForSelector('[data-cy="task-options"]', { state: 'hidden', timeout: 2000 });

    await page.click('[data-cy="new-task"]');

    await page.waitForSelector('[data-cy="task-options"]', { state: 'visible', timeout: 2000 });

    await page.fill('[data-cy="task-input"]', 'New Task');
    await page.keyboard.press('Enter');

    await page.waitForSelector('[data-cy="task"]', { state: 'visible', timeout: 2000 });

    const checkbox = await page.waitForSelector('[data-cy="task-done"]');
    await checkbox.check();

    await page.click('[data-cy="task"]');

    await page.waitForSelector('[data-cy="task-module"]', { state: 'visible', timeout: 2000 });

    await page.fill('[data-cy="task-module-name"]', '');
    await page.fill('[data-cy="task-module-name"]', 'Updated task name');
    await page.keyboard.press('Enter');

    await page.click('[data-cy="task-module-close"]');

    await page.waitForSelector('[data-cy="task-dropdown"]', { state: 'visible', timeout: 2000 });

    //await page.click('text="Delete task"');
    await page.getByText('Delete task').first().click({ timeout: 2000 });

    await page.waitForSelector('[data-cy="task-module"]', { state: 'hidden', timeout: 2000 });

    await page.waitForSelector('[data-cy="task"]', { state: 'hidden', timeout: 2000 });
});

test('Opens task detail', async ({ page, request }) => {
    await page.goto(`/board/${getBoardId}`);

    const newList = await createListViaApi(request, getBoardId, 'New List');
    const response = await newList.json();
    getListId = response.id;
    await createTaskViaApi(request, getBoardId, getListId, 'New Task');

    await page.click('[data-cy="task"]');
    await page.waitForSelector('[data-cy="task-description"]', { state: 'visible', timeout: 2000 });
    await page.click('[data-cy="task-description"]');
    await page.fill('[data-cy="task-description-input"]', 'Hello World');
    await page.click('[data-cy="task-description-save"]');

    const todayDate = new Date().toISOString().slice(0, 10);
    await page.click('[data-cy="task-deadline"]');
    await page.fill('[data-cy="task-deadline"]', todayDate);
    // await page.click('body'); 
    await page.keyboard.press('Tab');

    const fileInput = await page.$('[type="file"]');
    await fileInput.setInputFiles('cypress/fixtures/cypressLogo.png', { timeout: 2000 });
    await page.click('[data-cy="remove-image"]');

    await page.click('[data-cy="task-module-close"]');
    await page.waitForSelector('[data-cy="task-dropdown"]', { state: 'visible', timeout: 2000 });
    await page.getByText('Close task').first().click({ timeout: 2000 });
});

test('Sorts tasks and lists', async ({ page, request }) => {
    const newList = await createListViaApi(request, getBoardId, 'New List 1');
    const response = await newList.json();
    getListId = response.id;
    await createListViaApi(request, getBoardId, 'New List 2');
    await createTaskViaApi(request, getBoardId, getListId, 'New Task 1');
    await createTaskViaApi(request, getBoardId, getListId, 'New Task 2');

    await page.goto(`/board/${getBoardId}`);

    await performDragAndDrop(page, '[data-cy="task"]:nth-child(1)', '[data-cy="task"]:nth-child(2)');

    await performDragAndDrop(page, '[data-cy="list"]:nth-child(1) > [data-cy="tasks-list"] > [data-cy="task"]:nth-child(1)', '[data-cy="list"]:nth-child(2) > [data-cy="tasks-list"]');
    //await performDragAndDrop(page, '[data-cy="list"]:nth-child(2)', '[data-cy="list"]:nth-child(1)');
});

test("shows an error message when there's a network error on creating list", async ({ page }) => {
    page.route('**/api/lists', (route) => {
        route.abort();
    });

    await page.goto(`/board/${getBoardId}`);

    await page.click('[data-cy=add-list]');

    await page.fill('[data-cy=add-list-input]', 'New List');
    await page.keyboard.press('Enter');

    await page.waitForSelector('[id="errorMessage"]', { state: 'visible', timeout: 5000 });
    await page.waitForSelector('[id="errorMessage"]', { state: 'hidden', timeout: 5000 });
});

test("shows an error message when there’s a network error on creating task", async ({ page, request }) => {
    page.route('**/api/tasks', (route) => {
        route.abort();
    });

    await createListViaApi(request, getBoardId, 'New List');

    await page.goto(`/board/${getBoardId}`);

    await page.click('[data-cy=new-task]');

    await page.fill('[data-cy=task-input]', 'New Task');
    await page.keyboard.press('Enter');

    await page.waitForSelector('[id="errorMessage"]', { state: 'visible', timeout: 5000 });
    await page.waitForSelector('[id="errorMessage"]', { state: 'hidden', timeout: 5000 });
});

test("Update board name", async ({ page }) => {
    await page.goto(`/board/${getBoardId}`);
    const boardTitleElement = await page.$('[data-cy="board-title"]');
    await boardTitleElement.evaluate((el) => (el as HTMLInputElement).value).then((value) => {
        expect(value).toBe('New Board');
    });
    await page.fill('[data-cy="board-title"]', '');
    await page.fill('[data-cy="board-title"]', 'Updated Board Name');
    await page.keyboard.press('Enter');
    await boardTitleElement.evaluate((el) => (el as HTMLInputElement).value).then((value) => {
        expect(value).toBe('Updated Board Name');
    });
});
test("Delete board", async ({ page }) => {
    await page.goto(`/board/${getBoardId}`);
    await page.click('[data-cy="board-options"]');
    await page.getByText('Delete board').first().click({ timeout: 2000 });
});