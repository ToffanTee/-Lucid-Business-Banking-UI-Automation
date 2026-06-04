// Import commands.js using ES2015 syntax:
import './commands'
import 'cypress-mochawesome-reporter/register';

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


