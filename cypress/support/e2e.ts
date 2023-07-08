import '@4tw/cypress-drag-drop';
import 'cypress-file-upload';
import 'cypress-real-events';
import '@cypress/code-coverage/support';
require('@4tw/cypress-drag-drop');
const registerCypressGrep = require('@cypress/grep');
registerCypressGrep();


beforeEach(() => {
  Cypress.env('boards', []);
  Cypress.env('lists', []);
  Cypress.env('tasks', []);
  Cypress.env('users', []);
});

Cypress.on('uncaught:exception', (err, runnable) => {
  // returning false here prevents Cypress from
  // failing the test
  return false
})
