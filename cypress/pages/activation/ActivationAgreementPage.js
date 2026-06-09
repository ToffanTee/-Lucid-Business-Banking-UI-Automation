import { Logger } from "../../utils/logger";

class ActivationAgreementPage {

  elements = {
    stepHeader() {
      return cy.contains('Agreement')
    },

    checkboxes() {
      return cy.get('mat-checkbox')
    },

    submitButton() {
      return cy.contains('button', 'Submit')
    },

    successHeader() {
      return cy.contains('Success!')
    },

    finishButton() {
      return cy.contains('button', 'Finish')
    }
  }

  verifyPageIsDisplayed() {
    Logger.step('Verifying Agreement page is displayed')
    this.elements.stepHeader().should('be.visible')
    Logger.info('Agreement page displayed successfully')
  }

  checkAllAgreements() {
    Logger.step('Checking all agreements dynamically')
    cy.wait(1000)
    this.elements.checkboxes().should('have.length.greaterThan', 0).each(($el, index) => {
      Logger.info(`Checking agreement checkbox at index ${index}`)
      cy.wrap($el).click({ force: true })
    })
    Logger.info('All agreements checked successfully')
  }

  clickSubmit() {
    Logger.step('Clicking Submit button on Agreement page')
    cy.wait(1000)
    this.elements.submitButton().should('be.visible').click({ force: true })
    Logger.info('Submit button clicked successfully')
  }

  verifySuccessModalIsDisplayed() {
    Logger.step('Verifying Success modal is displayed')
    // Wait for the modal header to be visible (longer timeout if needed, default is fine)
    this.elements.successHeader().should('be.visible')
    Logger.info('Success modal displayed successfully')
  }

  clickFinish() {
    Logger.step('Clicking Finish button on Success modal')
    this.elements.finishButton().should('be.visible').click({ force: true })
    Logger.info('Finish button clicked successfully')
  }

  completeAgreementStep() {
    Logger.step('Completing Agreement step and Success modal')
    this.verifyPageIsDisplayed()
    this.checkAllAgreements()
    this.clickSubmit()
    this.verifySuccessModalIsDisplayed()
    this.clickFinish()
    Logger.info('Agreement step and Success modal completed')
  }

}

export default new ActivationAgreementPage();
