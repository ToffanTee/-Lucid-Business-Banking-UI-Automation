import { Logger } from "../../utils/logger";

class PasscodeVerificationPage {

  elements = {
    stepHeader() {
      return cy.contains('We sent you a Passcode')
    },

    /**
     * Returns the passcode input for a specific digit position (1-based).
     * Uses the same aria-label pattern as BVN OTP inputs.
     */
    passcodeDigitInput(position) {
      return cy.get(`[aria-label="One Time Password Input Number ${position}"]`)
    },

    confirmButton() {
      return cy.contains('button', 'Confirm')
    }
  }

  // Page Actions
  verifyPageIsDisplayed() {
    Logger.step('Verifying Passcode Verification page is displayed')
    this.elements.stepHeader().should('be.visible')
    Logger.info('Passcode Verification page displayed successfully')
  }

  /**
   * Enters passcode digits one at a time into individual input fields.
   * Reads passcode from Cypress.env('PASSCODE') if no value is passed.
   */
  enterPasscodeDigits(passcode) {
    const code = passcode || Cypress.env('PASSCODE')
    Logger.step('Entering passcode digits...')

    if (!code) {
      Logger.error('Passcode is not set — check Cypress.env("PASSCODE") in cypress.config.js')
      return
    }

    const digits = code.toString().split('')
    digits.forEach((digit, index) => {
      this.elements.passcodeDigitInput(index + 1).type(digit)
    })
    Logger.info('Passcode digits entered successfully')
  }

  clickConfirm() {
    Logger.step('Clicking Confirm button')
    this.elements.confirmButton().should('be.visible').click()
    Logger.info('Confirm button clicked successfully')
  }

  completePasscodeVerification() {
    Logger.step('Completing Passcode Verification step')
    this.verifyPageIsDisplayed()
    this.enterPasscodeDigits()
    this.clickConfirm()
    Logger.info('Passcode Verification step completed')
  }

}

export default new PasscodeVerificationPage();
