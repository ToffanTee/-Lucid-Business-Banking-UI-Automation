import { Logger } from "../../utils/logger";

class DeviceRegistrationPage {

  elements = {
    deviceNotRecognisedMessage() {
      return cy.contains('Device not recognised')
    },

    warningBanner() {
      return cy.contains('This Device is Either Not Yet To Be Registered')
    },

    /**
     * Returns the OTP input for a specific digit position (1-based).
     * Uses the same aria-label pattern as other OTP inputs in the app.
     */
    otpDigitInput(position) {
      return cy.get(`[aria-label="One Time Password Input Number ${position}"]`)
    },

    confirmButton() {
      return cy.contains('button', 'Confirm')
    },

    validateOtpTab() {
      return cy.contains('Validate OTP')
    },

    addDeviceTab() {
      return cy.contains('Add Device')
    },

    goBackLink() {
      return cy.contains('Go back')
    },

    // --- Device Registration confirmation page ---

    deviceRegistrationHeader() {
      return cy.contains('Device Registration!')
    },

    addDeviceButton() {
      return cy.get(':nth-child(1) > .bg-primary')
    },

    switchDeviceButton() {
      return cy.get(':nth-child(2) > .bg-primary')
    },

    noGoBackButton() {
      return cy.contains('No, Go back')
    }
  }

  // Page Actions
  verifyPageIsDisplayed() {
    Logger.step('Verifying Device Registration page is displayed')
    this.elements.deviceNotRecognisedMessage().should('be.visible')
    Logger.info('Device Registration page displayed successfully')
  }

  verifyDeviceConfirmationPage() {
    Logger.step('Verifying Device Registration confirmation page is displayed')
    this.elements.deviceRegistrationHeader().should('be.visible')
    Logger.info('Device Registration confirmation page displayed successfully')
  }

  /**
   * Enters the 6-digit OTP to register/validate the device.
   * Reads passcode from Cypress.env('PASSCODE') if no value is passed.
   */
  enterOtpDigits(passcode) {
    const otp = passcode || Cypress.env('PASSCODE')
    Logger.step('Entering passcode digits for device registration...')

    if (!otp) {
      Logger.error('Passcode is not set — check Cypress.env("PASSCODE") in cypress.config.js')
      return
    }

    const digits = otp.toString().split('')
    digits.forEach((digit, index) => {
      this.elements.otpDigitInput(index + 1).type(digit)
    })
    Logger.info('Device OTP digits entered successfully')
  }

  clickConfirm() {
    Logger.step('Clicking Confirm button for device registration')
    this.elements.confirmButton().should('be.visible').click()
    Logger.info('Device registration Confirm button clicked successfully')
  }

  clickAddDevice() {
    Logger.step('Clicking Add Device button')
    this.elements.addDeviceButton().should('be.visible').click()
    Logger.info('Add Device button clicked successfully')
  }

  clickSwitchDevice() {
    Logger.step('Clicking Switch to Device button')
    this.elements.switchDeviceButton().should('be.visible').click()
    Logger.info('Switch to Device button clicked successfully')
  }

  /**
   * Complete the device registration/OTP verification flow.
   * This is triggered after login when the device is not recognised.
   * @param {'add' | 'switch'} deviceAction — 'add' to add this device, 'switch' to switch to this device
   */
  completeDeviceRegistration(deviceAction = 'add') {
    Logger.step(`Completing Device Registration — action: ${deviceAction}`)

    // Step 1: OTP verification
    this.verifyPageIsDisplayed()
    this.enterOtpDigits()
    this.clickConfirm()

    // Step 2: Device confirmation page — Add or Switch
    this.verifyDeviceConfirmationPage()

    if (deviceAction === 'switch') {
      this.clickSwitchDevice()
    } else {
      this.clickAddDevice()
    }

    Logger.info('Device Registration completed successfully')
  }

  /**
   * Checks whether device registration is required after login.
   * If the URL contains '/auth/device', runs the full device registration flow.
   * Otherwise, skips — the user has been directed straight to the dashboard.
   * @param {'add' | 'switch'} deviceAction — 'add' to add this device, 'switch' to switch to this device
   * @param {{ username: string, password: string }} [credentials] — optional credentials to use for re-login.
   *   When provided, these are used instead of readEnvCredentials (useful for activation specs that
   *   log in with their own spec-specific user, not the EXISTING_USER).
   */
  handleDeviceRegistrationIfNeeded(deviceAction = 'add', credentials = null) {
    // Wait for the URL to change away from the login page before checking
    // This prevents a race condition where Cypress checks the URL before the app has time to redirect
    cy.url().should('not.include', '/login').then((url) => {
      if (url.includes('/auth/device')) {
        Logger.step('Device registration required — starting flow')
        this.completeDeviceRegistration(deviceAction)

        // Wait for the URL to change away from device registration
        cy.url().should('not.include', '/auth/device')

        // If we got redirected back to login page (post device registration), log in again
        cy.url().then((newUrl) => {
          if (newUrl.includes('/login')) {
            Logger.step('Redirected to login after device registration. Logging in again...')

            // Use caller-supplied credentials if available, otherwise fall back to .env
            const loginWithCredentials = ({ username, password }) => {
              if (username && password) {
                cy.get('app-custom-input').eq(0).find('.input').clear().type(username)
                cy.get('app-custom-input').eq(1).find('.input').clear().type(password)
                cy.contains('button', 'Login').click()
              } else {
                Logger.error('Auto-login failed: username or password not found')
              }
            }

            if (credentials && credentials.username && credentials.password) {
              loginWithCredentials(credentials)
            } else {
              cy.task('readEnvCredentials').then(loginWithCredentials)
            }
          }
        })
      } else {
        Logger.info('Device already registered — skipping to dashboard')
      }
    })
  }

}

export default new DeviceRegistrationPage();
