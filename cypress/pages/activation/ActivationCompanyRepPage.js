import { Logger } from "../../utils/logger";

class ActivationCompanyRepPage {

  elements = {
    stepHeader() {
      return cy.contains('Company Representative')
    },

    firstNameInput() {
      // Index 1 (Index 0 is Title dropdown container)
      return cy.get('app-custom-input').eq(1).find('.input')
    },

    lastNameInput() {
      return cy.get('app-custom-input').eq(2).find('.input')
    },

    emailInput() {
      return cy.get('app-custom-input').eq(3).find('.input')
    },

    phoneNumberInput() {
      return cy.get('app-custom-input').eq(4).find('.input')
    },

    addressInput() {
      // Index 8 (Indices 5, 6, 7 are Role, State, City dropdown containers)
      return cy.get('app-custom-input').eq(8).find('.input')
    },

    occupationInput() {
      return cy.get('app-custom-input').eq(9).find('.input')
    },

    ninInput() {
      return cy.get('app-custom-input').eq(10).find('.input')
    },

    mothersMaidenNameInput() {
      return cy.get('app-custom-input').eq(11).find('.input')
    },

    titleDropdown() {
      return cy.get('mat-select').eq(0)
    },

    roleDropdown() {
      return cy.get('mat-select').eq(1)
    },

    stateDropdown() {
      return cy.get('mat-select').eq(2)
    },

    cityDropdown() {
      return cy.get('mat-select').eq(3)
    },

    continueButton() {
      return cy.contains('button', 'Continue')
    }
  }

  // Page Actions
  verifyPageIsDisplayed() {
    Logger.step('Verifying Company Representative activation page is displayed')
    this.elements.stepHeader().should('be.visible')
    Logger.info('Company Representative activation page displayed successfully')
  }

  verifyPreFilledFields(data) {
    Logger.step('Verifying that Company Representative fields are pre-filled correctly')

    // 1. Text Inputs
    if (data.firstName) {
      this.elements.firstNameInput().should('have.value', data.firstName)
      Logger.info(`Firstname pre-filled correctly: ${data.firstName}`)
    }

    if (data.lastName) {
      this.elements.lastNameInput().should('have.value', data.lastName)
      Logger.info(`Lastname pre-filled correctly: ${data.lastName}`)
    }

    if (data.email) {
      this.elements.emailInput().should('have.value', data.email)
      Logger.info(`Email address pre-filled correctly: ${data.email}`)
    }

    if (data.phoneNumber) {
      const numberOnly = data.phoneNumber.startsWith('0')
        ? data.phoneNumber.substring(1)
        : data.phoneNumber
      this.elements.phoneNumberInput().should('have.value', numberOnly)
      Logger.info(`Phone number pre-filled correctly: ${numberOnly}`)
    }

    if (data.address) {
      this.elements.addressInput().should('have.value', data.address)
      Logger.info(`Address pre-filled correctly: ${data.address}`)
    }

    if (data.mothersMaidenName) {
      this.elements.mothersMaidenNameInput().should('have.value', data.mothersMaidenName)
      Logger.info(`Mother's maiden name pre-filled correctly: ${data.mothersMaidenName}`)
    }

    // 2. Dropdowns (verify text values inside the select fields)
    this.elements.titleDropdown().should('contain.text', 'Mr.')
    this.elements.roleDropdown().should('contain.text', 'INITIATOR')

    // Note: State and City names are selected from signupData. Verify they are not empty
    this.elements.stateDropdown().should('not.be.empty')
    this.elements.cityDropdown().should('not.be.empty')
  }

  fillOccupation(occupation) {
    Logger.step(`Entering occupation: ${occupation}`)
    this.elements.occupationInput().clear().type(occupation)
    Logger.info('Occupation entered successfully')
  }

  fillNin(nin) {
    Logger.step(`Entering NIN: ${nin}`)
    this.elements.ninInput().clear().type(nin)
    Logger.info('NIN entered successfully')
  }

  clickContinue() {
    Logger.step('Clicking Continue button on Company Representative activation page')
    this.elements.continueButton().should('be.visible').should('not.be.disabled').click()
    Logger.info('Continue button clicked successfully')
  }

}

export default new ActivationCompanyRepPage();
