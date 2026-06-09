import { Logger } from "../../utils/logger";

class ActivationAccountPreferencesPage {

  elements = {
    stepHeader() {
      return cy.contains('Account Preferences')
    },

    accountTypeDropdown() {
      // First mat-select on the page
      return cy.get('mat-select').eq(0)
    },

    currencyDropdown() {
      // Second mat-select on the page
      return cy.get('mat-select').eq(1)
    },

    soleSignatoryRadio() {
      return cy.contains('Sole signatory')
    },

    twoOrMoreRadio() {
      return cy.contains('Two or more')
    },

    jointSignatoryRadio() {
      return cy.contains('Joint signatory')
    },

    continueButton() {
      return cy.contains('button', 'Continue')
    }
  }

  verifyPageIsDisplayed() {
    Logger.step('Verifying Account Preferences page is displayed')
    this.elements.stepHeader().should('be.visible')
    Logger.info('Account Preferences page displayed successfully')
  }

  selectAccountType(optionText) {
    Logger.step(`Selecting Account Type: ${optionText || 'first option'}`)
    cy.wait(3000) // Wait for dropdown options to load/initialize
    this.elements.accountTypeDropdown().click({ force: true })
    cy.get('.mdc-list-item__primary-text, mat-option').should('be.visible')
    if (optionText) {
      cy.get('.mdc-list-item__primary-text, mat-option').contains(optionText).click({ force: true })
    } else {
      cy.get('.mdc-list-item__primary-text, mat-option').eq(0).click({ force: true })
    }
    Logger.info('Account Type selected successfully')
  }

  selectCurrency(currencyCode) {
    Logger.step(`Selecting Currency: ${currencyCode || 'NGN'}`)
    this.elements.currencyDropdown().click({ force: true })
    cy.get('.mdc-list-item__primary-text, mat-option').should('be.visible')
    if (currencyCode) {
      cy.get('.mdc-list-item__primary-text, mat-option').contains(currencyCode).click({ force: true })
    } else {
      cy.get('.mdc-list-item__primary-text, mat-option').contains('NGN').click({ force: true })
    }
    Logger.info('Currency selected successfully')
  }

  selectSoleSignatoryMandate() {
    Logger.step('Selecting "Sole signatory" mandate')
    this.elements.soleSignatoryRadio().click()
    Logger.info('"Sole signatory" mandate selected')
  }

  clickContinue() {
    Logger.step('Clicking Continue button on Account Preferences page')
    cy.wait(1000)
    this.elements.continueButton().should('be.visible').click({ force: true })
    Logger.info('Continue button clicked successfully')
  }

  completeAccountPreferences() {
    Logger.step('Completing Account Preferences step')
    this.verifyPageIsDisplayed()
    this.selectAccountType() // select the first available account type
    this.selectSoleSignatoryMandate()
    this.clickContinue()
    Logger.info('Account Preferences step completed')
  }

}

export default new ActivationAccountPreferencesPage();
