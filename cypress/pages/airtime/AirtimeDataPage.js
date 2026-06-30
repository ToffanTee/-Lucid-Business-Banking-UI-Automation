import { Logger } from "../../utils/logger";

class AirtimeDataPage {

  elements = {
    pageHeader() {
      return cy.contains('Airtime & Data')
    },

    providerSearchInput() {
      return cy.get('input[placeholder="Search provider...."]').filter(':visible')
    },

    airtimeSectionHeader() {
      return cy.contains('Airtime')
    },

    dataSectionHeader() {
      return cy.contains('Data')
    },

    providerGrid() {
      // The provider grid shares a container with the search input and has multiple images
      return cy.get('input[placeholder="Search provider...."]')
        .parents()
        .filter((idx, el) => {
          const $el = Cypress.$(el)
          return $el.find('img').length >= 3
        })
        .first()
    },

    providerTile(name) {
      // Scoped to provider grid to avoid matching History table rows
      return cy.get('input[placeholder="Search provider...."]')
        .parents()
        .filter((idx, el) => Cypress.$(el).find('img').length >= 3)
        .first()
        .contains(new RegExp(`^\\s*${name}\\s*$`))
    },

    purchasePanelHeader() {
      return cy.contains('Airtime Purchase')
    },

    payFromDropdown() {
      return cy.contains('Select account')
        .parents()
        .filter((idx, el) => Cypress.$(el).find('mat-select, select, .mat-mdc-select, [class*="dropdown"], [class*="select"]').length > 0)
        .first()
        .find('mat-select, select, .mat-mdc-select, [class*="dropdown"], [class*="select"]')
    },

    packageDropdown() {
      return cy.contains('Select package')
    },

    phoneNumberInput() {
      return cy.contains('Phone Number')
        .parents()
        .filter((idx, el) => Cypress.$(el).find('input').length > 0)
        .first()
        .find('input')
    },

    amountInput() {
      return cy.contains('Amount')
        .parents()
        .filter((idx, el) => Cypress.$(el).find('input').length > 0)
        .first()
        .find('input')
    },

    continueButton() {
      return cy.contains('button', 'Continue').filter(':visible')
    },

    confirmTransferButton() {
      return cy.contains('button', 'Confirm').filter(':visible')
    },

    historySection() {
      return cy.contains('History')
    },

    historySearchInput() {
      return cy.get('input[placeholder="Search by phone number"]').filter(':visible')
    },

    historyFilterButton() {
      return cy.contains('button', 'Filter').filter(':visible')
    },

    historyTableHeader() {
      return cy.contains('th, td, div', 'Network').filter(':visible')
    },

    successMessage() {
      return cy.contains('Request submitted successfully')
    }
  }

  // ——————————————————————————————————
  //  Page Actions
  // ——————————————————————————————————

  /**
   * Navigate to the Airtime & Data module via the sidebar.
   */
  navigateToAirtimeData() {
    Logger.step('Navigating to Airtime & Data page via sidebar')
    cy.get('a, mat-list-item, .nav-item').contains('Airtime & Data').click()
    this.elements.pageHeader().should('be.visible')
    Logger.info('Navigated to Airtime & Data page successfully')
  }

  /**
   * Verify the Airtime & Data landing page has loaded with core sections.
   */
  verifyPageLoaded() {
    Logger.step('Verifying Airtime & Data page has loaded')
    this.elements.pageHeader().should('be.visible')
    this.elements.airtimeSectionHeader().should('be.visible')
    this.elements.dataSectionHeader().should('be.visible')
    this.elements.historySection().should('be.visible')
    Logger.info('Airtime & Data page verified')
  }

  /**
   * Search for a provider using the search bar.
   * @param {string} query — provider name to search
   */
  searchProvider(query) {
    Logger.step(`Searching for provider: ${query}`)
    this.elements.providerSearchInput().clear().type(query)
    Logger.info(`Provider search entered: ${query}`)
  }

  /**
   * Click a provider tile to select it and open the purchase form.
   * @param {string} providerName — e.g. 'MTN', 'Glo', 'Airtel', '9Mobile'
   */
  selectProvider(providerName) {
    Logger.step(`Selecting provider: ${providerName}`)
    this.elements.providerTile(providerName).first().click()
    this.elements.purchasePanelHeader().should('be.visible')
    Logger.info(`Provider ${providerName} selected`)
  }

  /**
   * Select the package from the package dropdown.
   * @param {string} packageName — package name or partial match
   */
  selectPackage(packageName) {
    Logger.step(`Selecting package: ${packageName}`)
    this.elements.packageDropdown().click({ force: true })
    cy.get('.cdk-overlay-container, [role="dialog"], .modal, .dialog, mat-option')
      .last()
      .contains(new RegExp(packageName, 'i'))
      .click({ force: true })
    Logger.info(`Package set to: ${packageName}`)
  }

  /**
   * Select the first available package from the dropdown.
   */
  selectFirstPackage() {
    Logger.step('Selecting first available package')
    this.elements.packageDropdown().click({ force: true })
    cy.get('mat-option, .cdk-overlay-container li, [role="option"]')
      .filter(':visible')
      .first()
      .click({ force: true })
    Logger.info('First package selected')
  }

  /**
   * Enter the beneficiary phone number.
   * @param {string} phoneNumber — digits only, without country code prefix
   */
  fillPhoneNumber(phoneNumber) {
    Logger.step(`Entering phone number: ${phoneNumber}`)
    this.elements.phoneNumberInput().clear().type(phoneNumber)
    Logger.info(`Phone number entered: ${phoneNumber}`)
  }

  /**
   * Enter the airtime amount manually.
   * @param {string|number} amount — amount in NGN
   */
  fillAmount(amount) {
    Logger.step(`Entering amount: NGN ${amount}`)
    this.elements.amountInput().clear().type(amount.toString())
    Logger.info(`Amount set to NGN ${amount}`)
  }

  /**
   * Click the Continue button to proceed to confirmation.
   */
  clickContinue() {
    Logger.step('Clicking Continue button')
    this.elements.continueButton().click({ force: true })
    Logger.info('Continue button clicked')
  }

  /**
   * Select the Pay From account in the "Select account" modal that appears after Continue.
   * Selects the first available account and clicks Submit.
   * @param {number} index — zero-based index of the account to select (defaults to 0)
   */
  selectPayFromAccount(index = 0) {
    Logger.step('Selecting Pay From account in modal')
    this.elements.selectAccountModal().should('be.visible')
    this.elements.accountRadioOptions().eq(index).click({ force: true })
    this.elements.submitAccountButton().click({ force: true })
    Logger.info('Pay From account selected and submitted')
  }

  /**
   * Click Confirm button on the confirmation page.
   */
  clickConfirm() {
    Logger.step('Clicking Confirm button')
    this.elements.confirmTransferButton().click({ force: true })
    Logger.info('Confirm button clicked')
  }

  /**
   * Enter the 6-digit transaction PIN.
   * @param {string} pin — 6-digit PIN
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
        cy.get('input[type="password"], input[placeholder*="PIN"], input[placeholder*="pin"]').first().type(pin)
      }
    })
    Logger.info('Transaction PIN entered successfully')
  }

  /**
   * Enter the 6-digit OTP.
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
   * Search the purchase history by phone number.
   * @param {string} phoneNumber — phone number to search
   */
  searchHistory(phoneNumber) {
    Logger.step(`Searching history for phone: ${phoneNumber}`)
    this.elements.historySearchInput().clear().type(phoneNumber)
    Logger.info(`History search entered: ${phoneNumber}`)
  }

  /**
   * Verify the purchase was submitted successfully.
   */
  verifyPurchaseSuccess() {
    Logger.step('Verifying airtime purchase success message')
    this.elements.successMessage().should('be.visible')
    Logger.info('Confirmed: "Request submitted successfully" popup is visible')
  }
}

export default new AirtimeDataPage();
