import { Logger } from "../../utils/logger";

class TransfersPage {

  elements = {
    pageHeader() {
      return cy.get('h1, h2, h3, .title').contains('Transfers')
    },

    singleTransfersTab() {
      return cy.contains('Single Transfers')
    },

    bulkTransfersTab() {
      return cy.contains('Bulk Transfers')
    },

    sendMoneyButton() {
      return cy.contains('Send Money')
    }
  }

  // ——————————————————————————————————
  //  Page Actions
  // ——————————————————————————————————

  /**
   * Navigate to the Transfers module via the sidebar.
   */
  navigateToTransfers() {
    Logger.step('Navigating to Transfers page via sidebar')
    cy.get('a, mat-list-item, .nav-item').contains('Transfers').click()
    cy.url().should('include', '/app/transfers/home')
    Logger.info('Navigated to Transfers page successfully')
  }

  /**
   * Verify the Transfers landing page has loaded with core elements.
   */
  verifyPageLoaded() {
    Logger.step('Verifying Transfers page has loaded')
    this.elements.pageHeader().should('be.visible')
    this.elements.singleTransfersTab().should('be.visible')
    this.elements.bulkTransfersTab().should('be.visible')
    this.elements.sendMoneyButton().should('be.visible')
    Logger.info('Transfers page verified')
  }

  /**
   * Click the "Send Money" button to open the single transfer side panel.
   */
  clickSendMoney() {
    Logger.step('Clicking Send Money button')
    this.elements.sendMoneyButton().should('be.visible').click()
    cy.url().should('include', '/app/transfers/home/new-single-transfer')
    Logger.info('Send Money side panel opened successfully')
  }
}

export default new TransfersPage();
