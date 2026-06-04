import { Logger } from "../../utils/logger";

class BvnPage {

  elements = {
    stepHeader() {
      return cy.contains('Enter your BVN to get started')
    },

    bvnInput() {
      return cy.get('.input')
    },

    continueButton() {
      return cy.contains('button', 'Continue')
    }
  }

  // Page Actions
  verifyPageIsDisplayed() {
    Logger.step('Verifying BVN step is displayed')
    this.elements.stepHeader().should('be.visible')
    Logger.info('BVN step displayed successfully')
  }

  enterBvn(bvnNumber) {
    Logger.step('Entering BVN number...')
    if (bvnNumber) {
      this.elements.bvnInput().clear().type(bvnNumber)
      Logger.info('BVN number entered successfully')
    } else {
      Logger.error('BVN number is empty — cannot enter')
    }
  }

  clickContinue() {
    Logger.step('Clicking Continue button on BVN step')
    this.elements.continueButton().should('be.visible').click()
    Logger.info('Continue button clicked successfully')
  }

  completeBvnStep(bvnNumber) {
    Logger.step('Completing BVN step')
    this.verifyPageIsDisplayed()
    this.enterBvn(bvnNumber)
    this.clickContinue()
    Logger.info('BVN step completed')
  }

}

export default new BvnPage();
