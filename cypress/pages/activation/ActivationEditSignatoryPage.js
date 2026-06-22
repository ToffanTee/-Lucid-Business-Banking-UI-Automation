import { Logger } from "../../utils/logger";

class ActivationEditSignatoryPage {

  elements = {
    stepHeader() {
      return cy.contains('Edit signatory')
    },

    titleDropdown() {
      return cy.get('mat-select').eq(0)
    },

    firstNameInput() {
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

    roleDropdown() {
      return cy.get('mat-select').eq(1)
    },

    stateDropdown() {
      return cy.get('mat-select').eq(2)
    },

    cityDropdown() {
      return cy.get('mat-select').eq(3)
    },

    addressInput() {
      return cy.get('app-custom-input').eq(8).find('.input')
    },

    occupationInput() {
      return cy.get('app-custom-input').eq(9).find('.input')
    },

    mothersMaidenNameInput() {
      return cy.get('app-custom-input').eq(10).find('.input')
    },

    continueButton() {
      return cy.contains('button', 'Continue')
    }
  }

  // Page Actions
  verifyPageIsDisplayed() {
    Logger.step('Verifying Edit Signatory page is displayed')
    this.elements.stepHeader().should('be.visible')
    Logger.info('Edit Signatory page displayed successfully')
  }

  verifyPreFilledFields(expectedEmail, expectedFirstName, expectedRole) {
    Logger.step('Verifying prefilled fields on Edit Signatory page')
    if (expectedFirstName) {
      this.elements.firstNameInput().should('have.value', expectedFirstName)
      Logger.info(`First name verified: ${expectedFirstName}`)
    }
    if (expectedEmail) {
      this.elements.emailInput().should('have.value', expectedEmail)
      Logger.info(`Email verified: ${expectedEmail}`)
    }
    if (expectedRole) {
      this.elements.roleDropdown().should('contain.text', expectedRole)
      Logger.info(`Role verified: ${expectedRole}`)
    }
  }

  selectTitle(title) {
    Logger.step(`Selecting title: ${title}`)
    this.elements.titleDropdown().click()
    cy.get('.mdc-list-item__primary-text, mat-option').should('be.visible')
    const cleanTitle = title ? title.replace('.', '') : 'Mr'
    cy.get('.mdc-list-item__primary-text, mat-option').then(($options) => {
      const matched = $options.filter((idx, el) => {
        const text = el.innerText || el.textContent || '';
        return text.includes(cleanTitle);
      });
      if (matched.length > 0) {
        cy.wrap(matched.first()).click()
      } else {
        cy.wrap($options.eq(0)).click()
      }
    })
    Logger.info(`Title "${title}" selected successfully`)
  }

  fillLastName(lastName) {
    Logger.step(`Entering last name: ${lastName}`)
    this.elements.lastNameInput().clear().type(lastName)
    Logger.info('Last name entered successfully')
  }

  fillPhoneNumber(phoneNumber) {
    Logger.step(`Entering phone number: ${phoneNumber}`)
    const phone = phoneNumber || '8012345678'
    const numberOnly = phone.startsWith('0') ? phone.substring(1) : phone
    this.elements.phoneNumberInput().clear().type(numberOnly)
    Logger.info('Phone number entered successfully')
  }

  selectState(stateName) {
    Logger.step(`Selecting state: ${stateName || 'first option'}`)
    this.elements.stateDropdown().click()
    cy.get('.mdc-list-item__primary-text, mat-option').should('be.visible')
    if (stateName) {
      cy.get('.mdc-list-item__primary-text, mat-option').contains(stateName).click()
    } else {
      cy.get('.mdc-list-item__primary-text, mat-option').eq(0).click()
    }
    Logger.info('State selected successfully')
  }

  selectCity(cityName) {
    Logger.step(`Selecting city: ${cityName || 'first option'}`)
    this.elements.cityDropdown().click()
    cy.get('.mdc-list-item__primary-text, mat-option').should('be.visible')
    if (cityName) {
      cy.get('.mdc-list-item__primary-text, mat-option').contains(cityName).click()
    } else {
      cy.get('.mdc-list-item__primary-text, mat-option').eq(0).click()
    }
    Logger.info('City selected successfully')
  }

  fillAddress(address) {
    Logger.step(`Entering address: ${address}`)
    this.elements.addressInput().clear().type(address)
    Logger.info('Address entered successfully')
  }

  fillOccupation(occupation) {
    Logger.step(`Entering occupation: ${occupation}`)
    this.elements.occupationInput().clear().type(occupation)
    Logger.info('Occupation entered successfully')
  }

  fillMothersMaidenName(name) {
    Logger.step(`Entering mother's maiden name: ${name}`)
    this.elements.mothersMaidenNameInput().clear().type(name)
    Logger.info("Mother's maiden name entered successfully")
  }

  clickContinue() {
    Logger.step('Clicking Continue button on Edit Signatory page')
    this.elements.continueButton().should('be.visible').should('not.be.disabled').click()
    Logger.info('Continue button clicked successfully')
  }

  completeEditForm(data) {
    Logger.step('Completing Edit Signatory form')
    this.selectTitle(data.title || 'Mr.')
    this.fillLastName(data.lastName || 'SignatoryLastName')
    this.fillPhoneNumber(data.phoneNumber || '8012345678')
    this.selectState(data.state) // will fall back to first option if not provided
    this.selectCity(data.city)   // will fall back to first option if not provided
    this.fillAddress(data.address || '123 Test Street')
    this.fillOccupation(data.occupation || 'Business Analyst')
    this.fillMothersMaidenName(data.mothersMaidenName || 'Maiden')
    this.clickContinue()
    cy.wait(10000)
    Logger.info('Edit Signatory form completed and submitted')
  }

}

export default new ActivationEditSignatoryPage();
