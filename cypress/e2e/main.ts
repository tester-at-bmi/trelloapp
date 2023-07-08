import '../support/commands/addBoardApi';

interface AUTWindow extends Window {
  app: {
    toggleTools: () => void;
  };
}

it('tools work', { tags: ['@chrome', '@firefox', '@edge'] }, () => {

  cy
    .addBoardApi('new board');

  cy
    .intercept('DELETE', '/api/tasks').as('tasks')
    .intercept('DELETE', '/api/lists').as('lists')
    .intercept('DELETE', '/api/boards').as('boards')
    .intercept('DELETE', '/api/users').as('users')
    .intercept('POST', '/api/reset').as('all');

  cy
    .visit('/');

  cy
    .get('[data-cy="board-item"]')
    .should('be.visible');

  cy
    .window()
    .then((window) => {
      const myWindow = window as unknown as AUTWindow;
      myWindow.app.toggleTools();
    });

  cy
    .get('#tools')
    .should('be.visible');

  cy.contains('button', 'Tasks').click();
  cy.contains('button', 'Lists').click();
  cy.contains('button', 'Boards').click();
  cy.contains('button', 'Users').click();
  cy.contains('button', 'All').click();

  cy
    .wait('@tasks')
    .wait('@lists')
    .wait('@boards')
    .wait('@users')
    .wait('@all');

});