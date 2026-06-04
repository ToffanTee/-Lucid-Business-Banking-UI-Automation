import { Logger } from "../../utils/logger";

class BvnVerificationPage {

  elements = {
    stepHeader() {
      return cy.contains('Please enter the OTP sent to your BVN linked phone number')
    },

    /**
     * Returns the OTP input for a specific digit position (1-based).
     * Each input has aria-label like "One Time Password Input Number 1"
     */
    otpDigitInput(position) {
      return cy.get(`[aria-label="One Time Password Input Number ${position}"]`)
    },

    resendOtpButton() {
      return cy.contains('Resend')
    },

    confirmButton() {
      return cy.contains('button', 'Confirm')
    }
  }

  // Page Actions
  confirmPageIsDisplayed() {
    Logger.step('Confirming BVN Verification step is displayed')
    this.elements.stepHeader().should('be.visible')
    Logger.info('BVN Verification step displayed successfully')
  }

  /**
   * Enters OTP digits one at a time into individual input fields.
   * Reads OTP from Cypress.env('OTP_CODE') if no value is passed.
   */
  enterOtpDigits(otpCode) {
    const otp = otpCode || Cypress.env('OTP_CODE')
    Logger.step('Entering OTP digits for BVN verification...')

    if (!otp) {
      Logger.error('OTP code is not set — check Cypress.env("OTP_CODE") in cypress.config.js')
      return
    }

    const digits = otp.toString().split('')
    digits.forEach((digit, index) => {
      this.elements.otpDigitInput(index + 1).type(digit)
    })
    Logger.info('OTP digits entered successfully')
  }

  clickConfirm() {
    Logger.step('Clicking Confirm button')
    this.elements.confirmButton().should('be.visible').click()
    Logger.info('Confirm button clicked successfully')
  }

  completeBvnVerification() {
    Logger.step('Completing BVN Verification step')
    this.confirmPageIsDisplayed()
    this.enterOtpDigits()
    this.clickConfirm()
    Logger.info('BVN Verification step completed')
  }

}

export default new BvnVerificationPage();
