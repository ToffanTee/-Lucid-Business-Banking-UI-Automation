import { Logger } from "../../utils/logger";

class ActivationSummaryPage {

  elements = {
    stepHeader() {
      // Use loose matches for Summary page
      return cy.contains('Summary')
    },

    continueButton() {
      return cy.contains('button', 'Continue')
    }
  }

  verifyPageIsDisplayed() {
    Logger.step('Verifying Summary page is displayed')
    this.elements.stepHeader().should('be.visible')
    Logger.info('Summary page displayed successfully')
  }

  clickContinue() {
    Logger.step('Clicking Continue button on Summary page')
    cy.wait(2000) // Give summary page options time to fully render
    this.elements.continueButton().should('be.visible').click({ force: true })
    Logger.info('Continue button clicked successfully')
  }

  completeSummaryStep() {
    Logger.step('Completing Summary step')
    this.verifyPageIsDisplayed()
    this.clickContinue()
    Logger.info('Summary step completed')
  }

}

export default new ActivationSummaryPage();
