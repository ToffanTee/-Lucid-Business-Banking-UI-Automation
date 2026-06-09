// Import commands.js using ES2015 syntax:
import './commands'
import 'cypress-mochawesome-reporter/register';

Cypress.on('uncaught:exception', (err, runnable) => {
  // Returning false here prevents Cypress from failing the test
  console.warn(`Uncaught exception ignored: ${err.message}`)
  return false
})

before(function () {
  cy.log('This should execute before all test cases')
  // Grant geolocation permission via CDP — prevents the browser location prompt
  cy.grantGeolocation()
})

beforeEach(function () {
  cy.log('This should execute before each test case')
})

after(function () {
  cy.log('This should execute after all test cases')
})

afterEach(function () {
  cy.log('This should execute after each test case')
})



