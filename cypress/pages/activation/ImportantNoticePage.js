import { Logger } from "../../utils/logger";

class ImportantNoticePage {

  elements = {
    stepHeader() {
      return cy.contains('h3, h2, h1, div, p', 'Important Notice!')
    },

    continueButton() {
      return cy.contains('button', 'Continue to process')
    },

    goBackLink() {
      return cy.contains('a, p, span, div', 'Go back')
    }
  }

  // Page Actions
  verifyPageIsDisplayed() {
    Logger.step('Verifying Important Notice page is displayed')
    // Use a looser contains check in case the header tag changes
    cy.contains('Important Notice!').should('be.visible')
    this.elements.continueButton().should('be.visible')
    Logger.info('Important Notice page displayed successfully')
  }

  clickContinue() {
    Logger.step('Clicking Continue to process button')
    this.elements.continueButton().click()
    Logger.info('Continue to process button clicked successfully')
  }

  clickGoBack() {
    Logger.step('Clicking Go back link')
    this.elements.goBackLink().click()
    Logger.info('Go back link clicked successfully')
  }

}

export default new ImportantNoticePage();
