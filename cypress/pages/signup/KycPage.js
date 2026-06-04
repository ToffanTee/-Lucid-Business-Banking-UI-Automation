import { Logger } from "../../utils/logger";

class KycPage {

  elements = {
    stepHeader() {
      return cy.contains('create your organization profile')
    },

    companyNameInput() {
      return cy.get(':nth-child(1) > app-custom-input > .input')
    },

    companyEmailInput() {
      return cy.get(':nth-child(2) > app-custom-input > .input')
    },

    registrationNumberInput() {
      return cy.get(':nth-child(3) > app-custom-input > .input')
    },

    tinInput() {
      return cy.get(':nth-child(4) > app-custom-input > .input')
    },

    registrationDateInput() {
      return cy.get('#mat-input-2')
    },

    businessNatureInput() {
      return cy.get(':nth-child(6) > app-custom-input > .input')
    },

    companyAddressInput() {
      return cy.get(':nth-child(7) > app-custom-input > .input')
    },

    phoneNumberInput() {
      return cy.get('#mat-input-3')
    },

    continueButton() {
      return cy.contains('button', 'Continue')
    }
  }

  // Page Actions
  verifyPageIsDisplayed() {
    Logger.step('Verifying KYC / Organization Profile page is displayed')
    this.elements.stepHeader().should('be.visible')
    Logger.info('KYC page displayed successfully')
  }

  fillCompanyName(companyName) {
    Logger.step('Entering company/business name...')
    this.elements.companyNameInput().clear().type(companyName)
    Logger.info('Company name entered successfully')
  }

  fillCompanyEmail(companyEmail) {
    Logger.step('Entering company email...')
    this.elements.companyEmailInput().clear().type(companyEmail)
    Logger.info('Company email entered successfully')
  }

  fillRegistrationNumber(regNumber) {
    Logger.step('Entering registration number...')
    this.elements.registrationNumberInput().clear().type(regNumber)
    Logger.info('Registration number entered successfully')
  }

  fillTin(tin) {
    Logger.step('Entering TIN...')
    this.elements.tinInput().clear().type(tin)
    Logger.info('TIN entered successfully')
  }

  /**
   * Selects a random past date for registration.
   * Generates a date between 1 and 10 years ago to ensure it's never in the future.
   */
  fillRegistrationDate() {
    Logger.step('Entering registration date...')
    const today = new Date()
    const yearsAgo = Math.floor(Math.random() * 10) + 1
    const pastDate = new Date(today.getFullYear() - yearsAgo, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1)
    const month = String(pastDate.getMonth() + 1).padStart(2, '0')
    const day = String(pastDate.getDate()).padStart(2, '0')
    const year = pastDate.getFullYear()
    const formattedDate = `${month}/${day}/${year}`

    this.elements.registrationDateInput().clear().type(formattedDate)
    Logger.info(`Registration date entered: ${formattedDate}`)
  }

  fillBusinessNature(businessNature) {
    Logger.step('Entering business nature...')
    this.elements.businessNatureInput().clear().type(businessNature)
    Logger.info('Business nature entered successfully')
  }

  fillCompanyAddress(companyAddress) {
    Logger.step('Entering company address...')
    this.elements.companyAddressInput().clear().type(companyAddress)
    Logger.info('Company address entered successfully')
  }

  /**
   * Enters phone number with the leading zero removed.
   * e.g. 09039182773 → 9039182773
   */
  fillPhoneNumber(phoneNumber) {
    Logger.step('Entering phone number...')
    const formattedNumber = phoneNumber.startsWith('0')
        ? phoneNumber.substring(1)
        : phoneNumber
    this.elements.phoneNumberInput().clear().type(formattedNumber)
    Logger.info(`Phone number entered: ${formattedNumber}`)
  }

  clickContinue() {
    Logger.step('Clicking Continue button on KYC page')
    this.elements.continueButton().should('be.visible').click()
    Logger.info('Continue button clicked successfully')
  }

  completeKycStep(data) {
    Logger.step('Completing KYC / Organization Profile step')
    this.verifyPageIsDisplayed()
    this.fillCompanyName(data.companyName)
    this.fillCompanyEmail(data.companyEmail)
    this.fillRegistrationNumber(data.registrationNumber)
    this.fillTin(data.tin)
    this.fillRegistrationDate()
    this.fillBusinessNature(data.businessNature)
    this.fillCompanyAddress(data.companyAddress)
    this.fillPhoneNumber(data.companyPhoneNumber)
    this.clickContinue()
    Logger.info('KYC step completed')
  }

}

export default new KycPage();
