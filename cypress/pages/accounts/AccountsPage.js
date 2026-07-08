import { Logger } from "../../utils/logger";

class AccountsPage {

  elements = {
    pageHeader() {
      return cy.contains('Accounts')
    },

    goBackLink() {
      return cy.contains('Go back')
    },

    /**
     * Returns all account card containers on the dashboard.
     * Each card displays company name, account number, type, and balances.
     */
    accountCards() {
      return cy.get('.account-card, .card-container, mat-card').filter(':visible')
    },

    /**
     * Finds an account card by its displayed account number.
     * @param {string} accountNumber — e.g. '1200005265'
     */
    accountNumberText(accountNumber) {
      return cy.contains(accountNumber)
    },

    /**
     * Copy button adjacent to the account number.
     * Uses the Material button touch target inside the .copy container.
     */
    copyButton() {
      return cy.get('.copy > .mat-mdc-button-touch-target')
    },

    availableBalanceLabel() {
      return cy.contains('Available Balance')
    },

    withdrawableAmountLabel() {
      return cy.contains('Withdrawable Amount')
    },

    /**
     * Eye/visibility toggle icon to show or hide the balance amounts.
     */
    eyeToggle() {
      return cy.get('.toggle-account > .mat-mdc-button-touch-target')
    },

    sendMoneyButton() {
      return cy.contains('Send Money')
    },

    generateStatementButton() {
      return cy.contains('Generate Statement')
    },

    /**
     * Account type badge (e.g. "Savingsorcurrent").
     * Can filter dynamically by expected text/type.
     * @param {string} [typeText] — expected type text
     */
    accountTypeBadge(typeText) {
      const badge = cy.get('.rounded-2xl').filter(':visible')
      return typeText ? badge.contains(typeText) : badge
    },

    /**
     * Company/business name displayed on the account card.
     */
    companyName() {
      return cy.contains('Digicore Corporated')
    }
  }

  // ——————————————————————————————————
  //  Page Actions
  // ——————————————————————————————————

  /**
   * Navigate to the Accounts dashboard from anywhere in the app.
   * Clicks the "Accounts" link in the sidebar navigation.
   */
  navigateToAccounts() {
    Logger.step('Navigating to Accounts page via sidebar')
    cy.get('a, mat-list-item, .nav-item').contains('Accounts').click()
    cy.url().should('include', '/app/accounts/dashboard')
    Logger.info('Navigated to Accounts dashboard')
  }

  /**
   * Verify the Accounts dashboard page has loaded with at least one account card.
   */
  verifyPageLoaded() {
    Logger.step('Verifying Accounts dashboard page has loaded')
    cy.url().should('include', '/app/accounts/dashboard')
    this.elements.pageHeader().should('be.visible')
    Logger.info('Accounts dashboard page verified')
  }

  /**
   * Wait for account cards to be visible on the page.
   * Ensures the page data has loaded before interacting with cards.
   */
  waitForAccountCards() {
    Logger.step('Waiting for account cards to be visible')
    // Wait for at least one account-related element to appear
    this.elements.availableBalanceLabel().should('be.visible')
    Logger.info('Account cards are visible')
  }

  /**
   * Click an account card (by account number) to navigate to account details.
   * @param {string} accountNumber — the account number to click, e.g. '1200005265'
   */
  navigateToAccountDetails(accountNumber) {
    Logger.step(`Navigating to account details for account: ${accountNumber}`)
    this.waitForAccountCards()
    cy.wait(1000) // allow account data to be fetched before selecting a card
    this.elements.accountNumberText(accountNumber).should('be.visible').click()
    cy.wait(1000) // allow account detail data to be fetched after selecting
    this.verifyAccountDetailPageLoaded(accountNumber)
    Logger.info(`Navigated to account details for ${accountNumber}`)
  }

  /**
   * Click the first visible account card to navigate to its details.
   * Use this when you don't care which specific account is selected.
   */
  navigateToFirstAccountDetails() {
    Logger.step('Navigating to first available account details')
    this.waitForAccountCards()
    this.elements.availableBalanceLabel().should('be.visible')
    cy.wait(1000) // allow account data to be fetched before selecting a card
    // Click the account number area to open details
    cy.get('.account-number, .nuban').first().click()
    cy.wait(1000) // allow account detail data to be fetched after selecting
    this.verifyAccountDetailPageLoaded()
    Logger.info('Navigated to first account details')
  }

  /**
   * Verify the Account Details page has loaded with key elements.
   * @param {string} [accountNumber] — expected account number
   */
  verifyAccountDetailPageLoaded(accountNumber) {
    Logger.step('Verifying Account Details page has loaded')
    cy.url().should('include', '/app/accounts/account-detail')
    this.elements.goBackLink().should('be.visible')
    this.elements.sendMoneyButton().should('be.visible')
    this.elements.generateStatementButton().should('be.visible')
    if (accountNumber) {
      this.elements.accountNumberText(accountNumber).should('be.visible')
    }
    Logger.info('Account Details page verified')
  }

  /**
   * Verify the account card on the dashboard displays the expected details.
   * @param {object} options
   * @param {string} [options.accountNumber] — expected account number
   * @param {string} [options.companyName] — expected company/business name
   * @param {string} [options.accountType] — expected account type badge text (e.g. "Savingsorcurrent")
   */
  verifyAccountCardDetails({ accountNumber, companyName, accountType } = {}) {
    Logger.step('Verifying account card details')
    this.waitForAccountCards()

    this.elements.availableBalanceLabel().should('be.visible')
    this.elements.withdrawableAmountLabel().should('be.visible')

    if (accountNumber) {
      this.elements.accountNumberText(accountNumber).should('be.visible')
    }

    if (companyName) {
      cy.contains(companyName).should('be.visible')
    }

    this.elements.copyButton().should('be.visible')
    
    if (accountType) {
      this.elements.accountTypeBadge(accountType).should('be.visible')
    } else {
      this.elements.accountTypeBadge().should('be.visible')
    }

    Logger.info('Account card details verified')
  }

  /**
   * Click the copy button to copy the account number/IBAN to clipboard.
   * @param {string} accountNumber — the account number to locate before copying
   */
  copyAccountNumber(accountNumber) {
    Logger.step(`Copying account number: ${accountNumber}`)
    this.elements.accountNumberText(accountNumber).should('be.visible')
    this.elements.copyButton().click({ force: true })
    Logger.info('Copy button clicked — account number copied to clipboard')
  }

  /**
   * Click the "Send Money" button on the account card.
   */
  clickSendMoney() {
    Logger.step('Clicking Send Money button')
    this.elements.sendMoneyButton().should('be.visible').click()
    Logger.info('Send Money button clicked')
  }

  /**
   * Click the "Generate Statement" button on the account card.
   */
  clickGenerateStatement() {
    Logger.step('Clicking Generate Statement button')
    this.elements.generateStatementButton().should('be.visible').click()
    Logger.info('Generate Statement button clicked')
  }

  /**
   * Toggle balance visibility using the eye icon.
   */
  toggleBalanceVisibility() {
    Logger.step('Toggling balance visibility')
    this.elements.eyeToggle().click({ force: true })
    Logger.info('Balance visibility toggled')
  }

  /**
   * Click the "Go back" link to return to the previous page.
   */
  clickGoBack() {
    Logger.step('Clicking Go back link')
    this.elements.goBackLink().should('be.visible').click()
    Logger.info('Go back link clicked')
  }
}

export default new AccountsPage();
