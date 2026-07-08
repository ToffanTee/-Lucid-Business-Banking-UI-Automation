import { Logger } from "../../utils/logger";

class CardManagementPage {

  elements = {
    pageHeader() {
      return cy.contains('Card Management')
    },

    noActiveCardMessage() {
      return cy.contains('No active card')
    },

    cardRequestHistoryHeader() {
      return cy.contains('Card Request History')
    },

    noCardsYetMessage() {
      return cy.contains('No Cards Yet!')
    },

    noCardsGuidanceText() {
      return cy.contains('Your Cards History Will Show Up Here After You Make Your First Card Request.')
    },

    requestNewCardButton() {
      return cy.contains('button', 'Request new card').filter(':visible')
    },

    noItemSelectedMessage() {
      return cy.contains('No Item Selected')
    },

    // --- "Request a Card" panel ---

    requestCardPanelHeader() {
      return cy.contains('Request a Card')
    },

    requestForDropdown() {
      // "Request for" is rendered by a custom <app-custom-account-input> component
      // (not a mat-select/native select) — scope to its own field container by the
      // <label> text, then target the actual clickable trigger inside it.
      return cy.contains('label', 'Request for')
        .parent()
        .find('app-custom-account-input .cursor-pointer')
        .first()
    },

    cardTypeDropdown() {
      return cy.get('#app-body app-custom-input[placeholder="Select Card Profile..."] div.mat-mdc-form-field-infix')
    },

    nameOnCardInput() {
      return cy.contains('Name on Card')
        .parents()
        .filter((idx, el) => Cypress.$(el).find('input').length > 0)
        .first()
        .find('input')
    },

    modeOfDeliveryDropdown() {
      return cy.get('#mat-select-value-3')
    },

    cardRequestTypeDropdown() {
      return cy.get('#mat-select-value-5')
    },

    continueButton() {
      return cy.contains('button', 'Continue').filter(':visible')
    },

    confirmButton() {
      return cy.contains('button', 'Confirm').filter(':visible')
    },

    successMessage() {
      return cy.contains('Card Request sent for Approval')
    },

    selectAccountModal() {
      return cy.get('.cdk-overlay-container, [role="dialog"], .modal, .dialog').filter(':visible').last()
    },

    accountRadioOptions() {
      return this.selectAccountModal().find('input[type="radio"]')
    },

    submitAccountButton() {
      return this.selectAccountModal().contains('button', /Submit|Continue|Select|Confirm/i)
    }
  }

  // ——————————————————————————————————
  //  Page Actions
  // ——————————————————————————————————

  /**
   * Navigate to the Card Management module via the sidebar.
   */
  navigateToCardManagement() {
    Logger.step('Navigating to Card Management page via sidebar')
    cy.get('a, mat-list-item, .nav-item').contains('Card Management').click()
    this.elements.pageHeader().should('be.visible')
    Logger.info('Navigated to Card Management page successfully')
  }

  /**
   * Verify the Card Management landing page has loaded with core sections.
   */
  verifyPageLoaded() {
    Logger.step('Verifying Card Management page has loaded')
    this.elements.pageHeader().should('be.visible')
    this.elements.cardRequestHistoryHeader().should('be.visible')
    Logger.info('Card Management page verified')
  }

  /**
   * Verify the empty state is shown when no card requests exist yet.
   */
  verifyEmptyState() {
    Logger.step('Verifying empty state is displayed')
    this.elements.noCardsYetMessage().should('be.visible')
    this.elements.noCardsGuidanceText().should('be.visible')
    Logger.info('Empty state verified — "No Cards Yet!" message visible')
  }

  /**
   * Click the "Request new card" button to open the Request a Card panel.
   */
  clickRequestNewCard() {
    Logger.step('Clicking Request new card button')
    this.elements.requestNewCardButton().click({ force: true })
    this.elements.requestCardPanelHeader().should('be.visible')
    Logger.info('Request a Card panel opened')
  }

  /**
   * Select the account to request the card for, in the "Select account" modal.
   * Selects the first available account and submits, mirroring the
   * Pay From account selection used in Airtime & Data / Transfers.
   * @param {number} index — zero-based index of the account to select (defaults to 0)
   */
  selectRequestForAccount(index = 0) {
    Logger.step('Selecting account to request card for')
    cy.wait(1000) // allow account data to be fetched before opening the modal
    this.elements.requestForDropdown().click({ force: true })
    this.elements.selectAccountModal().should('be.visible')
    this.elements.accountRadioOptions().eq(index).click({ force: true })
    this.elements.submitAccountButton().click({ force: true })
    cy.wait(1000) // allow the selection to be applied before continuing
    Logger.info('Account selected for card request')
  }

  /**
   * Select the Card Type from the "Select Card Profile..." dropdown.
   * @param {string} cardTypeName — e.g. 'Royal Special'
   */
  selectCardType(cardTypeName) {
    Logger.step(`Selecting card type: ${cardTypeName}`)
    cy.wait(2000) // Wait for Angular event listeners and API options to load
    this.elements.cardTypeDropdown().click({ force: true })
    cy.get('.cdk-overlay-container, [role="listbox"]').find('[role="option"]').contains(new RegExp(cardTypeName, 'i')).click({ force: true })
    Logger.info(`Card type set to: ${cardTypeName}`)
  }

  /**
   * Select the first available card profile from the Card Type dropdown.
   */
  selectFirstCardType() {
    Logger.step('Selecting first available card type')
    cy.wait(2000) // Wait for Angular event listeners and API options to load
    this.elements.cardTypeDropdown().click({ force: true })
    cy.get('.cdk-overlay-container, [role="listbox"]').find('[role="option"]').first().click({ force: true })
    Logger.info('First card type selected')
  }

  /**
   * Enter the (optional) name to print on the card.
   * @param {string} name — preferred name on the card
   */
  fillNameOnCard(name) {
    Logger.step(`Entering name on card: ${name}`)
    this.elements.nameOnCardInput().clear().type(name)
    Logger.info(`Name on card entered: ${name}`)
  }

  /**
   * Select the Mode of Delivery.
   * @param {string} mode — e.g. 'Home Delivery'
   */
  selectModeOfDelivery(mode) {
    Logger.step(`Selecting mode of delivery: ${mode}`)
    cy.wait(1500)
    this.elements.modeOfDeliveryDropdown().click({ force: true })
    cy.get('.cdk-overlay-container, [role="listbox"]').find('[role="option"]').contains(new RegExp(mode, 'i')).click({ force: true })
    Logger.info(`Mode of delivery set to: ${mode}`)
  }

  /**
   * Select the first available option from the Mode of Delivery dropdown.
   */
  selectFirstModeOfDelivery() {
    Logger.step('Selecting first available mode of delivery')
    cy.wait(1500)
    this.elements.modeOfDeliveryDropdown().click({ force: true })
    cy.get('.cdk-overlay-container, [role="listbox"]').find('[role="option"]').first().click({ force: true })
    Logger.info('First mode of delivery selected')
  }

  /**
   * Select the Card Request Type.
   * @param {string} type — e.g. 'Batch Issuance'
   */
  selectCardRequestType(type) {
    Logger.step(`Selecting card request type: ${type}`)
    cy.wait(1500)
    this.elements.cardRequestTypeDropdown().click({ force: true })
    cy.get('.cdk-overlay-container, [role="listbox"]').find('[role="option"]').contains(new RegExp(type, 'i')).click({ force: true })
    Logger.info(`Card request type set to: ${type}`)
  }

  /**
   * Select the first available option from the Card Request Type dropdown.
   */
  selectFirstCardRequestType() {
    Logger.step('Selecting first available card request type')
    cy.wait(1500)
    this.elements.cardRequestTypeDropdown().click({ force: true })
    cy.get('.cdk-overlay-container, [role="listbox"]').find('[role="option"]').first().click({ force: true })
    Logger.info('First card request type selected')
  }

  /**
   * Click the Continue button to proceed from the Request a Card form.
   */
  clickContinue() {
    Logger.step('Clicking Continue button on Request a Card form')
    this.elements.continueButton().click({ force: true })
    Logger.info('Continue button clicked')
  }

  /**
   * Click Confirm button on the confirmation page.
   */
  clickConfirm() {
    Logger.step('Clicking Confirm button')
    this.elements.confirmButton().click({ force: true })
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
   * Verify the card request was submitted successfully.
   */
  verifyRequestSuccess() {
    Logger.step('Verifying card request success message')
    this.elements.successMessage().should('be.visible')
    Logger.info('Confirmed: "Card Request sent for Approval" popup is visible')
  }

  /**
   * Complete the full Request a Card flow end-to-end, including the
   * transaction PIN and OTP confirmation steps shared with Airtime & Data / Transfers.
   * Dropdown fields (Card Type, Mode of Delivery, Card Request Type) are dynamic —
   * the options available depend on the account and environment, so unless an
   * explicit value is passed, the first available option is selected for each.
   * @param {object} options
   * @param {string} [options.cardType] — card profile name to select; defaults to the first available option
   * @param {string} [options.nameOnCard] — optional name to print on the card
   * @param {string} [options.modeOfDelivery] — delivery mode to select; defaults to the first available option
   * @param {string} [options.cardRequestType] — request type to select; defaults to the first available option
   * @param {string} options.pin — 6-digit transaction PIN
   * @param {string} [options.otp] — 6-digit OTP (falls back to Cypress.env('PASSCODE'))
   */
  requestNewCard({ cardType, nameOnCard, modeOfDelivery, cardRequestType, pin, otp } = {}) {
    Logger.step('Starting Request a Card flow')
    this.clickRequestNewCard()
    this.selectRequestForAccount()

    if (cardType) {
      this.selectCardType(cardType)
    } else {
      this.selectFirstCardType()
    }

    if (nameOnCard) {
      this.fillNameOnCard(nameOnCard)
    }

    if (modeOfDelivery) {
      this.selectModeOfDelivery(modeOfDelivery)
    } else {
      this.selectFirstModeOfDelivery()
    }

    if (cardRequestType) {
      this.selectCardRequestType(cardRequestType)
    } else {
      this.selectFirstCardRequestType()
    }

    this.clickContinue()
    this.clickConfirm()
    this.enterTransactionPin(pin)
    this.clickConfirm()

    cy.wait(3000)
    const passcode = otp || Cypress.env('PASSCODE') || '654321'
    this.enterTransactionOtp(passcode)
    this.clickConfirm()

    this.verifyRequestSuccess()
    Logger.info('Request a Card flow completed successfully')
  }
}

export default new CardManagementPage();
