import { Logger } from "../../utils/logger";

class ForgotPasswordPage {

    elements = {
        forgotPasswordLink() {
            return cy.get('.space-y-5 > .text-center > .hover\\:underline')
        },

        pageHeader() {
            return cy.contains('Please enter your credentials to continue.')
        },

        usernameHeader() {
            return cy.contains('Enter your username to proceed.')
        },

        usernameInput() {
            return cy.get('.input')
        },

        continueButton() {
            return cy.contains('button', 'Continue')
        },

        goBackLink() {
            return cy.contains('Go back')
        },

        // --- Validate Passcode Step ---

        passcodeHeader() {
            return cy.contains('We sent you a Passcode')
        },

        /**
         * Returns the passcode input for a specific digit position (1-based).
         * Uses the same aria-label pattern as other OTP inputs in the app.
         */
        passcodeDigitInput(position) {
            return cy.get(`[aria-label="One Time Password Input Number ${position}"]`)
        },

        confirmButton() {
            return cy.contains('button', 'Confirm')
        },

        // --- Create New Password Step ---

        createPasswordHeader() {
            return cy.contains('Create a new password')
        },

        newPasswordInput() {
            return cy.get('input[type="password"]').first()
        },

        confirmPasswordInput() {
            return cy.get('input[type="password"]').last()
        },

        createPasswordContinueButton() {
            return cy.contains('button', 'Continue')
        },

        passwordChangedSuccess() {
            return cy.contains('password', { matchCase: false })
        }
    }

    // =============================================
    // Step 1: Username
    // =============================================

    navigateToForgotPassword() {
        Logger.step('Navigating to Forgot Password page')
        cy.visit('/login')
        cy.url().should('include', 'lucid-corporate')
        this.elements.pageHeader().should('be.visible')
        this.elements.forgotPasswordLink().should('be.visible').click()
        Logger.info('Forgot password link clicked successfully')
    }

    verifyPageIsDisplayed() {
        Logger.step('Verifying Forgot Password username step is displayed')
        this.elements.usernameHeader().should('be.visible')
        Logger.info('Forgot Password username step displayed successfully')
    }

    fillUsername(username) {
        Logger.step('Entering username...')
        if (username) {
            this.elements.usernameInput().clear()
            this.elements.usernameInput().type(username)
            Logger.info('Username entered successfully')
        } else {
            Logger.error('Username is empty — cannot enter')
        }
    }

    clickContinue() {
        Logger.step('Clicking Continue button')
        this.elements.continueButton().should('be.visible').click()
        Logger.info('Continue button clicked successfully')
    }

    /**
     * Submit the username for the forgot password flow.
     * @param {string} username - The username to recover the password for.
     */
    submitUsername(username) {
        Logger.step('Submitting username for forgot password...')
        this.verifyPageIsDisplayed()
        this.fillUsername(username)
        this.clickContinue()
        Logger.info('Username submitted successfully')
    }

    // =============================================
    // Step 2: Validate Passcode
    // =============================================

    verifyPasscodePageIsDisplayed() {
        Logger.step('Verifying Forgot Password passcode step is displayed')
        this.elements.passcodeHeader().should('be.visible')
        Logger.info('Forgot Password passcode step displayed successfully')
    }

    /**
     * Enters the 6-digit passcode to validate the password reset request.
     * Reads passcode from Cypress.env('PASSCODE') if no value is passed.
     */
    enterPasscodeDigits(passcode) {
        const code = passcode || Cypress.env('PASSCODE')
        Logger.step('Entering passcode digits for password reset...')

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

    /**
     * Submit the passcode for the forgot password flow.
     * @param {string} passcode - The passcode received via email.
     */
    submitPasscode(passcode) {
        Logger.step('Submitting passcode for forgot password...')
        this.verifyPasscodePageIsDisplayed()
        this.enterPasscodeDigits(passcode)
        this.clickConfirm()
        Logger.info('Passcode submitted successfully')
    }

    // =============================================
    // Step 3: Create New Password
    // =============================================

    verifyCreatePasswordPageIsDisplayed() {
        Logger.step('Verifying Create New Password step is displayed')
        this.elements.createPasswordHeader().should('be.visible')
        Logger.info('Create New Password step displayed successfully')
    }

    fillNewPassword(password) {
        Logger.step('Entering new password...')
        if (password) {
            this.elements.newPasswordInput()
                .clear()
                .type(password, { delay: 50, parseSpecialCharSequences: false })
            Logger.info('New password entered successfully')
        } else {
            Logger.error('New password is empty — cannot enter')
        }
    }

    fillConfirmPassword(password) {
        Logger.step('Entering confirm password...')
        if (password) {
            this.elements.confirmPasswordInput()
                .clear()
                .type(password, { delay: 50, parseSpecialCharSequences: false })
                .blur()
            Logger.info('Confirm password entered successfully')
        } else {
            Logger.error('Confirm password is empty — cannot enter')
        }
    }

    clickCreatePasswordContinue() {
        Logger.step('Clicking Continue button on Create New Password step')
        this.elements.createPasswordContinueButton()
            .should('be.visible')
            .should('not.be.disabled')
            .click()
        Logger.info('Create New Password Continue button clicked successfully')
    }

    /**
     * Submit the new password and update the .env file.
     * @param {string} newPassword - The new password to set.
     */
    submitNewPassword(newPassword) {
        Logger.step('Submitting new password...')
        this.verifyCreatePasswordPageIsDisplayed()
        this.fillNewPassword(newPassword)
        this.fillConfirmPassword(newPassword)
        this.clickCreatePasswordContinue()
        Logger.info('New password submitted successfully')
    }

    // =============================================
    // Full Flow Orchestrator
    // =============================================

    /**
     * Complete the entire forgot password flow end-to-end:
     *   1. Navigate & submit username
     *   2. Enter & confirm passcode
     *   3. Create new password & update .env
     *
     * @param {string} username - The username to recover.
     * @param {string} newPassword - The new password to set.
     * @param {string} [passcode] - The passcode (defaults to Cypress.env('PASSCODE')).
     */
    completeForgotPasswordFlow(username, newPassword, passcode) {
        Logger.step('Starting complete Forgot Password flow...')

        // Step 1 — Username
        this.navigateToForgotPassword()
        this.submitUsername(username)

        // Step 2 — Passcode
        this.submitPasscode(passcode)

        // Step 3 — Create new password
        this.submitNewPassword(newPassword)

        Logger.info('Forgot Password flow completed successfully')
    }

}

export default new ForgotPasswordPage();
