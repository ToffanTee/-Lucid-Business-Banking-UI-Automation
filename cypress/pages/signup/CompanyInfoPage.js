import { Logger } from "../../utils/logger";

class CompanyInfoPage {

  elements = {
    stepHeader() {
      return cy.contains('Company information')
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

    // TODO: Update selector if needed — Registration date picker
    registrationDateInput() {
      return cy.get('#mat-input-0')
    },

    businessNatureInput() {
      return cy.get(':nth-child(6) > app-custom-input > .input')
    },

    companyAddressInput() {
      return cy.get(':nth-child(7) > app-custom-input > .input')
    },

    // TODO: Update selector if needed — Phone number with +234 prefix
    phoneNumberInput() {
      return cy.get('#mat-input-1')
    },

    continueButton() {
      return cy.contains('button', 'Continue')
    }
  }

  // Page Actions
  verifyPageIsDisplayed() {
    Logger.step('Verifying Company Information page is displayed')
    this.elements.stepHeader().should('be.visible')
    Logger.info('Company Information page displayed successfully')
  }

  fillCompanyName(companyName) {
    Logger.step('Entering company/business name...')
    if (companyName) {
      this.elements.companyNameInput().clear().type(companyName)
      Logger.info('Company name entered successfully')
    } else {
      Logger.error('Company name is empty — cannot enter')
    }
  }

  fillCompanyEmail(companyEmail) {
    Logger.step('Entering company email...')
    if (companyEmail) {
      this.elements.companyEmailInput().clear().type(companyEmail)
      Logger.info('Company email entered successfully')
    } else {
      Logger.error('Company email is empty — cannot enter')
    }
  }

  fillRegistrationNumber(regNumber) {
    Logger.step('Entering registration number/CAC number...')
    if (regNumber) {
      this.elements.registrationNumberInput().clear().type(regNumber)
      Logger.info('Registration number entered successfully')
    } else {
      Logger.error('Registration number is empty — cannot enter')
    }
  }

  fillTin(tin) {
    Logger.step('Entering TIN...')
    if (tin) {
      this.elements.tinInput().clear().type(tin)
      Logger.info('TIN entered successfully')
    } else {
      Logger.error('TIN is empty — cannot enter')
    }
  }

  /**
   * Selects a random past date for registration.
   * Generates a date between 1 and 10 years ago.
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
    if (businessNature) {
      this.elements.businessNatureInput().clear().type(businessNature)
      Logger.info('Business nature entered successfully')
    } else {
      Logger.error('Business nature is empty — cannot enter')
    }
  }

  fillCompanyAddress(companyAddress) {
    Logger.step('Entering company address...')
    if (companyAddress) {
      this.elements.companyAddressInput().clear().type(companyAddress)
      Logger.info('Company address entered successfully')
    } else {
      Logger.error('Company address is empty — cannot enter')
    }
  }

  /**
   * Enters phone number with the leading zero removed.
   * e.g. 09039182773 → 9039182773
   */
  fillPhoneNumber(phoneNumber) {
    Logger.step('Entering phone number...')
    if (phoneNumber) {
      const formattedNumber = phoneNumber.startsWith('0')
        ? phoneNumber.substring(1)
        : phoneNumber
      this.elements.phoneNumberInput().clear().type(formattedNumber)
      Logger.info(`Phone number entered: ${formattedNumber}`)
    } else {
      Logger.error('Phone number is empty — cannot enter')
    }
  }

  clickContinue() {
    Logger.step('Clicking Continue button on Company Info page')
    this.elements.continueButton().should('be.visible').click()
    Logger.info('Continue button clicked successfully')
  }

  completeCompanyInfoStep(data) {
    Logger.step('Completing Company Information step')
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
    Logger.info('Company Information step completed')
  }

}

export default new CompanyInfoPage();
