import { expect } from '@playwright/test';

/**
 * A helper method for resetting the state of the app via the API.
 * @param request 
 */
export async function resetViaApi(request) {
  const newReset = await request.post(`/reset`);
  expect(newReset.ok()).toBeTruthy();
}

/**
 * A helper method for creating a board via the API.
 * @param request 
 * @param boardName 
 * @returns 
 * @example await createBoardViaApi(request, 'New Board');
 */
export async function createBoardViaApi(request, boardName): Promise<any> {
  const board = await request.post(`/api/boards`, {
    data: {
      name: boardName,
    },
  });
  expect(board.ok()).toBeTruthy();
  return board;
}

/**
 * A helper method for updating a board via the API.
 * @param request 
 * @param boardName 
 * @returns 
 * @example await updateBoardViaApi(request, 24490729405, 'Update Board');
 */
export async function updateBoardViaApi(request, boardId, boardName): Promise<any> {
  const board = await request.patch(`/api/boards/${boardId}`, {
    data: {
      name: boardName,
    },
  });
  expect(board.ok()).toBeTruthy();
  return board;
}

/**
 * A helper method for deleting a board via the API.
 * @param request 
 * @param boardId 
 */
export async function deleteBoardViaApi(request, boardId) {
  const board = await request.delete(`/api/boards/${boardId}`);
  expect(board.ok()).toBeTruthy();
}

/**
 * A helper method for creating a list via the API.
 * @param request 
 * @param getBoardId 
 * @param listName 
 * @returns 
 */
export async function createListViaApi(request, getBoardId, listName): Promise<any> {
  const list = await request.post(`/api/lists`, {
    data: {
      boardId: getBoardId,
      title: listName
    }
  });
  expect(list.ok()).toBeTruthy();
  return list;
}

/**
 * A helper method for creating a task via the API.
 * @param request 
 * @param getBoardId 
 * @param getListId 
 * @param taskName 
 * @returns 
 */
export async function createTaskViaApi(request, getBoardId, getListId, taskName): Promise<any> {
  const task = await request.post(`/api/tasks`, {
    data: {
      listId: getListId,
      boardId: getBoardId,
      title: taskName
    }
  });
  expect(task.ok()).toBeTruthy();
  return task;
}

/**
 * 
 * @param request 
 * @param getBoardId 
 * @param getListId 
 * @param taskName 
 * @returns 
 */
export async function signUpViaApi(request, getEmail, getPassword): Promise<any> {
  const signup = await request.post(`/api/signup`, {
    data: {
      email: getEmail,
      password: getPassword,
    }
  });
  expect(signup.ok()).toBeTruthy();
  return signup;
}