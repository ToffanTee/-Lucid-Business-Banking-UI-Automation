import { Logger } from "../../utils/logger";

class IntraBankTransferPage {

  elements = {
    singleTransferHeader() {
      return cy.contains('Single Transfer')
    },

    beneficiaryItem(name) {
      return cy.contains('.beneficiary-name, .beneficiary, div', name)
    },

    intraBankOption() {
      return cy.contains('First Ally Accounts')
    },

    formContainer() {
      return cy.contains(/^\s*Single Transfer\s*$/)
        .parents()
        .filter((idx, el) => Cypress.$(el).find('input, select, mat-select, .mat-mdc-select').length > 0)
        .first()
    },

    payFromDropdown() {
      return this.formContainer()
        .contains('Pay from')
        .parents()
        .filter((idx, el) => Cypress.$(el).find('mat-select, select, .mat-mdc-select').length > 0)
        .first()
        .find('mat-select, select, .mat-mdc-select')
    },

    destinationAccountInput() {
      return this.formContainer()
        .contains('Destination account number')
        .parents()
        .filter((idx, el) => Cypress.$(el).find('input').length > 0)
        .first()
        .find('input')
    },

    amountInput() {
      return this.formContainer()
        .contains('Amount')
        .parents()
        .filter((idx, el) => Cypress.$(el).find('input').length > 0)
        .first()
        .find('input')
    },

    spendingCategoryDropdown() {
      return this.formContainer()
        .contains('Spending Category')
        .parents()
        .filter((idx, el) => Cypress.$(el).find('.justify-between, mat-select, select, .mat-mdc-select').length > 0)
        .first()
        .find('.justify-between, mat-select, select, .mat-mdc-select')
    },

    descriptionInput() {
      return this.formContainer()
        .contains('Description')
        .parents()
        .filter((idx, el) => Cypress.$(el).find('input').length > 0)
        .first()
        .find('input')
    },

    startDateInput() {
      return cy.get('input[placeholder="MM/DD/YYYY"]').filter(':visible').first()
    },

    endDateInput() {
      return cy.get('input[placeholder="MM/DD/YYYY"]').filter(':visible').eq(1)
    },

    frequencyDropdown() {
      return cy.contains('Frequency')
        .parents()
        .filter((idx, el) => Cypress.$(el).find('.justify-between, mat-select, select, .mat-mdc-select').length > 0)
        .first()
        .find('.justify-between, mat-select, select, .mat-mdc-select')
    },

    frequencyRequiredError() {
      return cy.contains('Field is required')
    },

    continueButton() {
      return cy.get('[class*="ng-tns-c3740896876-"] > .bg-primary').filter(':visible')
    },

    confirmTransferButton() {
      return cy.contains('button', 'Confirm').filter(':visible')
    },

    successMessage() {
      return cy.contains('Request submitted successfully')
    }
  }

  // ——————————————————————————————————
  //  Page Actions
  // ——————————————————————————————————

  /**
   * Verify the Single Transfer side panel is visible.
   */
  verifySidePanelVisible() {
    Logger.step('Verifying Single Transfer side panel is visible')
    this.elements.singleTransferHeader().should('be.visible')
    Logger.info('Single Transfer side panel verified')
  }

  /**
   * Switch the single transfer mode to Intra-bank ("First Ally Accounts").
   */
  switchToIntraBank() {
    Logger.step('Switching to First Ally Accounts (Intra-bank)')
    this.elements.intraBankOption().should('be.visible').click()
    Logger.info('Switched to First Ally Accounts mode')
  }

  /**
   * Select a saved beneficiary by clicking their bubble.
   * @param {string} name — beneficiary name, e.g. "Laura Akinloye"
   */
  selectBeneficiary(name) {
    Logger.step(`Selecting beneficiary: ${name}`)
    this.elements.beneficiaryItem(name).should('be.visible').click()
    Logger.info(`Beneficiary ${name} clicked`)
  }

  /**
   * Select the source account to transfer from.
   * @param {string} accountNumber — NUBAN of the source account
   */
  selectSourceAccount(accountNumber) {
    Logger.step(`Selecting source account: ${accountNumber}`)
    this.elements.payFromDropdown().click()
    cy.contains('mat-option', accountNumber).click()
    Logger.info(`Source account ${accountNumber} selected`)
  }

  /**
   * Enter the destination account number and wait for name resolution API to complete.
   * @param {string} accountNumber — NUBAN of the destination account
   */
  fillDestinationAccount(accountNumber) {
    Logger.step(`Entering destination account number: ${accountNumber}`)

    // Intercept the account name lookup/inquiry API if it exists
    cy.intercept('**/*inquiry*').as('accountEnquiry')

    this.elements.destinationAccountInput().clear().type(accountNumber)

    // Wait for resolution (or general timeout if no request is triggered)
    cy.wait('@accountEnquiry', { timeout: 15000 }).its('response.statusCode').should('eq', 200)

    Logger.info(`Destination account entered and resolved`)
  }

  /**
   * Enter the transfer amount.
   * @param {number|string} amount — value to transfer
   */
  fillAmount(amount) {
    Logger.step(`Entering amount: NGN ${amount}`)
    this.elements.amountInput().clear().type(amount.toString())
    Logger.info(`Amount set to NGN ${amount}`)
  }

  /**
   * Select a spending category for the transaction.
   * @param {string} category — name of the category to select
   */
  selectSpendingCategory(category) {
    Logger.step(`Selecting spending category: ${category}`)
    this.elements.spendingCategoryDropdown().click({ force: true })

    // Find the active overlay/dialog container and select the category option
    cy.get('.cdk-overlay-container, [role="dialog"], .modal, .dialog')
      .last()
      .contains(new RegExp(`^\\s*${category}\\s*$`, 'i'))
      .click({ force: true })

    Logger.info(`Spending category set to ${category}`)
  }

  /**
   * Enter transaction description.
   * @param {string} desc — narration text
   */
  fillDescription(desc) {
    Logger.step(`Entering description: "${desc}"`)
    this.elements.descriptionInput().clear().type(desc)
    Logger.info('Description entered')
  }

  /**
   * Select the transaction scheduling option.
   * @param {'Now' | 'Later' | 'Repeating'} option — scheduling type
   */
  selectScheduleOption(option) {
    Logger.step(`Selecting schedule option: ${option}`)
    cy.contains('mat-radio-button, label, .radio', option).click()
    Logger.info(`Schedule option set to: ${option}`)
  }

  /**
   * Fill the start date for Later or Repeating schedule.
   * @param {string} date — date string in MM/DD/YYYY format
   */
  fillStartDate(date) {
    Logger.step(`Entering start date: ${date}`)
    this.elements.startDateInput().clear().type(date)
    Logger.info(`Start date set to ${date}`)
  }

  /**
   * Fill the end date for Repeating schedule.
   * @param {string} date — date string in MM/DD/YYYY format
   */
  fillEndDate(date) {
    Logger.step(`Entering end date: ${date}`)
    this.elements.endDateInput().clear().type(date)
    Logger.info(`End date set to ${date}`)
  }

  /**
   * Select the repeat frequency for a Repeating scheduled transfer.
   * @param {string} frequency — e.g. 'Monthly', 'Weekly', 'Daily'
   */
  selectFrequency(frequency) {
    Logger.step(`Selecting frequency: ${frequency}`)
    this.elements.frequencyDropdown().click({ force: true })
    cy.get('.cdk-overlay-container, [role="dialog"], .modal, .dialog')
      .last()
      .contains(new RegExp(`^\\s*${frequency}\\s*$`, 'i'))
      .click({ force: true })
    Logger.info(`Frequency set to ${frequency}`)
  }

  /**
   * Click the Continue button at the bottom of the form.
   */
  clickContinue() {
    Logger.step('Clicking Continue button')
    this.elements.continueButton().click({ force: true })
    Logger.info('Continue button clicked')
  }

  /**
   * Click Confirm button on the confirmation page.
   */
  clickConfirmTransfer() {
    Logger.step('Clicking Confirm button on transaction confirmation')
    this.elements.confirmTransferButton().click({ force: true })
    Logger.info('Confirm transaction button clicked')
  }

  /**
   * Enters the 6-digit transaction PIN.
   * Works with both individual digit input fields and standard inputs.
   * @param {string} pin — 6-digit transaction PIN
   */
  enterTransactionPin(pin) {
    Logger.step('Entering Transaction PIN...')
    const digits = pin.toString().split('')

    cy.get('body').then($body => {
      const pinFields = $body.find('[aria-label*="Pin Input"], [aria-label*="PIN Input"], [aria-label*="Pin"], [aria-label*="PIN"]')
      if (pinFields.length > 0) {
        digits.forEach((digit, index) => {
          cy.wrap(pinFields).eq(index).type(digit)
        })
      } else {
        // Fallback to any visible password input
        cy.get('input[type="password"], input[placeholder*="PIN"], input[placeholder*="pin"]').first().type(pin)
      }
    })
    Logger.info('Transaction PIN entered successfully')
  }

  /**
   * Enters the 6-digit transaction confirmation OTP.
   * @param {string} otp — 6-digit OTP code
   */
  enterTransactionOtp(otp) {
    Logger.step('Entering Transaction OTP...')
    const digits = otp.toString().split('')

    cy.get('body').then($body => {
      const hasAriaLabel = $body.find('[aria-label*="One Time Password Input"]').length > 0
      if (hasAriaLabel) {
        digits.forEach((digit, index) => {
          cy.get(`[aria-label="One Time Password Input Number ${index + 1}"]`).type(digit)
        })
      } else {
        // Fallback: look for inputs under validation container or generic text/tel inputs
        cy.get('input[type="text"], input[type="tel"]').each(($input, idx) => {
          if (idx < digits.length) {
            cy.wrap($input).type(digits[idx])
          }
        })
      }
    })
    Logger.info('OTP entered successfully')
  }

  /**
   * Verify the transfer request was submitted successfully.
   */
  verifyTransferSuccess() {
    Logger.step('Verifying transfer success message')
    this.elements.successMessage().should('be.visible')
    Logger.info('Confirmed: "Request submitted successfully" pop up is visible')
  }
}

export default new IntraBankTransferPage();
