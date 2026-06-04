import { Logger } from "../../utils/logger";

class RegistrationTypePage {

  elements = {
    signUpLink() {
      return cy.get('.text-primary')
    },

    pageHeader() {
      return cy.contains('Who are you registering as')
    },

    signatoryDirectorOption() {
      return cy.contains('As a Signatory/Director')
    },

    companyRepOption() {
      return cy.contains('As a Company rep')
    }
  }

  // Page Actions

  /**
   * Navigate to the signup flow by visiting the login page
   * and clicking the Sign Up link.
   */
  navigateToSignUp() {
    Logger.step('Navigating to Sign Up page')
    cy.visit('/login')
    cy.url().should('include', 'lucid-corporate')
    this.elements.signUpLink().should('be.visible').click()
    Logger.info('Navigated to Sign Up page successfully')
  }

  verifyPageIsDisplayed() {
    Logger.step('Verifying "Who are you registering as?" page is displayed')
    this.elements.pageHeader().should('be.visible')
    this.elements.signatoryDirectorOption().should('be.visible')
    this.elements.companyRepOption().should('be.visible')
    Logger.info('Registration type page displayed successfully')
  }

  selectSignatoryDirector() {
    Logger.step('Selecting "As a signatory/director" option')
    this.elements.signatoryDirectorOption().should('be.visible').click()
    Logger.info('Signatory/Director option selected successfully')
  }

  selectCompanyRep() {
    Logger.step('Selecting "As a company rep" option')
    this.elements.companyRepOption().should('be.visible').click()
    Logger.info('Company Rep option selected successfully')
  }

}

export default new RegistrationTypePage();

