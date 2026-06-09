import { Logger } from "../../utils/logger";

class DashboardPage {

  elements = {
    stepHeader() {
      // Find the main "Dashboard" title on the page
      return cy.get('h1, h2, h3, .title').contains('Dashboard')
    },

    availableBalance() {
      return cy.contains('Available Balance')
    },

    sendMoneyButton() {
      return cy.contains('Send Money')
    },

    quickTransfersSection() {
      return cy.contains('Quick Transfers')
    },

    recentTransactionsSection() {
      return cy.contains('Recent Transactions')
    },

    quickActionsSection() {
      return cy.contains('Quick actions')
    }
  }

  verifyDashboardLoaded() {
    Logger.step('Verifying Dashboard page has loaded and core elements are visible')
    cy.url().should('include', '/app/dashboard/summary')
    this.elements.stepHeader().should('be.visible')
    this.elements.availableBalance().should('be.visible')
    this.elements.sendMoneyButton().should('be.visible')
    this.elements.quickTransfersSection().should('be.visible')
    this.elements.recentTransactionsSection().should('be.visible')
    this.elements.quickActionsSection().should('be.visible')
    Logger.info('Dashboard verified loaded successfully')
  }

}

export default new DashboardPage();
