import { Logger } from "../../utils/logger";

class YopmailPage {

  visitAndGetVerificationLink(email) {
    Logger.step(`Visiting Yopmail to get verification link for: ${email}`);

    const username = email.split('@')[0];

    cy.visit('https://yopmail.com', {
      timeout: 30000,
      failOnStatusCode: false
    });

    // Type the username and press Enter to submit (the arrow is not a standard button element)
    Logger.step(`Entering inbox name: ${username}`);
    cy.get('input[placeholder="Enter your inbox here"]', { timeout: 15000 })
      .should('be.visible')
      .clear()
      .type(`${username}{enter}`);

    Logger.step('Waiting for inbox to load and email to appear...');

    // The inbox list is inside an iframe — wait for it then click the email
    cy.get('iframe#ifinbox', { timeout: 30000 }).should('exist').then($iframe => {
      const $body = $iframe.contents().find('body');
      cy.wrap($body).contains('soloto@digicoreltd.com', { timeout: 30000 }).first().click({ force: true });
    });

    Logger.step('Email clicked. Extracting verification link...');

    // Email content is in a second iframe.
    // The onboarding URL is plain text (not a hyperlink), so extract it via regex from the body text.
    cy.get('iframe#ifmail', { timeout: 15000 }).should('exist').then($iframe => {
      const $body = $iframe.contents().find('body');
      cy.wrap($body).invoke('text').then(text => {
        const match = text.match(/(https?:\/\/[^\s\[\]]+\/auth\/onboarding\/[^\s\[\]]+)/);
        if (!match) throw new Error('Onboarding URL not found in email body');
        Logger.info(`Found verification link: ${match[1]}`);
        cy.wrap(match[1]).as('verificationLink');
      });
    });

    return '@verificationLink';
  }
}

export default new YopmailPage();
