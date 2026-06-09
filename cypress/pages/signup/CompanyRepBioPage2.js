import { Logger } from "../../utils/logger";

class CompanyRepBioPage2 {

  elements = {
    stepHeader() {
      return cy.contains('Company Rep Bio (2/2)')
    },

    addressInput() {
      return cy.get(':nth-child(1) > app-custom-input > .input')
    },

    stateDropdown() {
      return cy.get('mat-select').eq(0)
    },

    cityDropdown() {
      return cy.get('mat-select').eq(1)
    },

    stateOfOriginDropdown() {
      return cy.get('mat-select').eq(2)
    },

    mothersMaidenNameInput() {
      return cy.get('.mb-6 > app-custom-input > .input')
    },

    continueButton() {
      return cy.contains('button', 'Continue')
    }
  }

  // Page Actions
  verifyPageIsDisplayed() {
    Logger.step('Verifying Company Rep Bio (2/2) page is displayed')
    this.elements.stepHeader().should('be.visible')
    Logger.info('Company Rep Bio (2/2) page displayed successfully')
  }

  fillAddress(address) {
    Logger.step('Entering address...')
    if (address) {
      this.elements.addressInput().clear().type(address)
      Logger.info('Address entered successfully')
    } else {
      Logger.error('Address is empty — cannot enter')
    }
  }

  selectState() {
    Logger.step('Selecting a state from dropdown...')
    cy.wait(1000)
    this.elements.stateDropdown().should('be.visible').click({ force: true })
    cy.get('.mdc-list-item__primary-text, mat-option').should('be.visible')
    cy.get('.mdc-list-item__primary-text, mat-option').then(($options) => {
      const randomIndex = Math.floor(Math.random() * $options.length)
      cy.wrap($options.eq(randomIndex)).click({ force: true })
    })
    Logger.info('State selected successfully')
  }

  /**
   * Select a random city from the dropdown.
   * City options depend on the previously selected state.
   */
  selectCity() {
    Logger.step('Selecting a city from dropdown...')
    cy.wait(1000)
    this.elements.cityDropdown().should('be.visible').click({ force: true })
    cy.get('.mdc-list-item__primary-text, mat-option').should('be.visible')
    cy.get('.mdc-list-item__primary-text, mat-option').then(($options) => {
      const randomIndex = Math.floor(Math.random() * $options.length)
      cy.wrap($options.eq(randomIndex)).click({ force: true })
    })
    Logger.info('City selected successfully')
  }

  /**
   * Select a random state of origin from the dropdown.
   */
  selectStateOfOrigin() {
    Logger.step('Selecting state of origin from dropdown...')
    cy.wait(1000)
    this.elements.stateOfOriginDropdown().should('be.visible').click({ force: true })
    cy.get('.mdc-list-item__primary-text, mat-option').should('be.visible')
    cy.get('.mdc-list-item__primary-text, mat-option').then(($options) => {
      const randomIndex = Math.floor(Math.random() * $options.length)
      cy.wrap($options.eq(randomIndex)).click({ force: true })
    })
    Logger.info('State of origin selected successfully')
  }

  fillMothersMaidenName(maidenName) {
    Logger.step("Entering mother's maiden name...")
    if (maidenName) {
      this.elements.mothersMaidenNameInput().clear().type(maidenName)
      Logger.info("Mother's maiden name entered successfully")
    } else {
      Logger.error("Mother's maiden name is empty — cannot enter")
    }
  }

  clickContinue() {
    Logger.step('Clicking Continue button on Company Rep Bio (2/2)')
    this.elements.continueButton().should('be.visible').click()
    Logger.info('Continue button clicked successfully')
  }

  completeCompanyRepBio2(data) {
    Logger.step('Completing Company Rep Bio (2/2) step')
    this.verifyPageIsDisplayed()
    this.fillAddress(data.address)
    this.selectState()
    this.selectCity()
    this.selectStateOfOrigin()
    this.fillMothersMaidenName(data.mothersMaidenName)
    this.clickContinue()
    Logger.info('Company Rep Bio (2/2) step completed')
  }

}

export default new CompanyRepBioPage2();
