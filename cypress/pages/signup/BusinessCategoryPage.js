import { Logger } from "../../utils/logger";

class BusinessCategoryPage {

  elements = {
    pageHeader() {
      return cy.contains('Provide the required details to get started')
    },

    businessCategoryDropdown() {
      return cy.get('.mat-mdc-form-field-infix')
    },

    businessCategoryOptions() {
      return cy.get('mat-option')
    },

    agreementCheckbox() {
      return cy.get('#mat-mdc-checkbox-1-input')
    },

    contineButton() {
      return cy.contains('button', 'Contine')
    }
  }

  // Page Actions
  verifyPageIsDisplayed() {
    Logger.step('Verifying Business Category page is displayed')
    this.elements.pageHeader().should('be.visible')
    Logger.info('Business Category page displayed successfully')
  }

  selectBusinessCategory() {
    Logger.step('Selecting a random business category...')
    this.elements.businessCategoryDropdown().click()
    this.elements.businessCategoryOptions()
      .should('have.length.greaterThan', 0)
      .then(($options) => {
        const randomIndex = Math.floor(Math.random() * $options.length)
        this.elements.businessCategoryOptions().eq(randomIndex).click()
      })
    Logger.info('Business category selected successfully')
  }

  checkAgreementCheckbox() {
    Logger.step('Checking the agreement checkbox')
    this.elements.agreementCheckbox().click()
    Logger.info('Agreement checkbox checked successfully')
  }

  clickContine() {
    Logger.step('Clicking Contine button')
    this.elements.contineButton().should('be.visible').click()
    Logger.info('Contine button clicked successfully')
  }

  completeBusinessCategoryStep() {
    Logger.step('Completing Business Category step')
    this.verifyPageIsDisplayed()
    this.selectBusinessCategory()
    this.checkAgreementCheckbox()
    this.clickContine()
    Logger.info('Business Category step completed')
  }

}

export default new BusinessCategoryPage();
