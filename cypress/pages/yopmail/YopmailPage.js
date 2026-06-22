import { Logger } from "../../utils/logger";

class YopmailPage {
  
  visitAndGetVerificationLink(email) {
    Logger.step(`Visiting Yopmail to get verification link for: ${email}`);
    
    // Yopmail blocks some automated browsers, but typically works in Cypress with chromeWebSecurity: false.
    // We use a fresh visit to yopmail.com
    cy.visit('https://yopmail.com/en/');
    
    // Wait for the page to load and the login input to be visible
    cy.get('#login', { timeout: 15000 }).should('be.visible').clear().type(email + '{enter}');
    
    // Now we should be in the inbox.
    Logger.step('Waiting for the email to appear in the inbox list');
    
    // First, click refresh to ensure we pull the latest emails
    cy.get('#refresh').click({ force: true });
    
    // Use .should() to safely and continuously query the iframe content until the email arrives,
    // avoiding the "detached from DOM" error caused by the iframe auto-refreshing.
    cy.get('iframe#ifinbox', { timeout: 30000 }).should($iframe => {
      const $body = $iframe.contents().find('body');
      // Assert that the text matches our target email so Cypress keeps retrying until it does
      expect($body.text()).to.match(/soloto@digicoreltd\.com|no reply/i);
    }).then($iframe => {
      // Once the assertion passes, the email is present and stable in the DOM. We can click it.
      const $body = $iframe.contents().find('body');
      cy.wrap($body).contains(/soloto@digicoreltd\.com|no reply/i).first().click({ force: true });
    });

    Logger.step('Email clicked. Fetching email content');
    
    // The email content is inside another iframe with id "ifmail"
    cy.get('iframe#ifmail', { timeout: 20000 }).should('exist').then(($iframe) => {
      const $body = $iframe.contents().find('body');
      
      // Wait until the body has content (meaning the email loaded)
      cy.wrap($body).should('not.be.empty');
      
      // Now find the verification link. The user noted the link might not be clickable,
      // so we will extract the URL directly from the text content.
      cy.wrap($body).invoke('text').then((text) => {
        // Regex to match the lucid-corporate onboarding URL
        const urlRegex = /(https:\/\/[^\s]*\/auth\/onboarding\/[^\s\[\]]+)/;
        const match = text.match(urlRegex);
        
        if (match && match[1]) {
          const href = match[1];
          Logger.info(`Found verification link in text: ${href}`);
          
          // Save the link to a Cypress alias so the calling spec can use it
          cy.wrap(href).as('verificationLink');
        } else {
          throw new Error('Could not find the onboarding URL in the email text.');
        }
      });
    });
    
    // We return the alias name so the caller can use cy.get('@verificationLink')
    return '@verificationLink';
  }
}

export default new YopmailPage();
