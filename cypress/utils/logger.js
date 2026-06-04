/**
 * Simple logger wrapper to make test steps more visible in Cypress command log
 */
export const Logger = {
  step: (message) => {
    cy.log(`**STEP:** ${message}`);
  },
  info: (message) => {
    cy.log(`*INFO:* ${message}`);
  },
  error: (message) => {
    cy.log(`**ERROR:** ${message}`);
  }
};
