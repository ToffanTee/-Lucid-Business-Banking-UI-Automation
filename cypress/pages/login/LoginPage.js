import { Logger } from "../../utils/logger";

class LoginPage {

  elements = {

    usernameInput() {
      return cy.get('app-custom-input').eq(0).find('.input')
    },

    passwordInput() {
      return cy.get('app-custom-input').eq(1).find('.input')
    },

    loginButton() {
      return cy.contains('button', 'Login')
    }
  }

  // Page Actions
  visitLoginPage() {
    Logger.step('Opening Lucid Business Banking login page')
    cy.visit('/login')
    cy.url().should('include', 'lucid-corporate')
    Logger.info('Login page loaded successfully')
  }

  fillUsername(username) {
    Logger.step('Entering username...')
    if (username) {
      this.elements.usernameInput().clear().type(username)
      Logger.info('Username entered successfully')
    } else {
      Logger.error('Username is empty — cannot enter')
    }
  }

  fillPassword(password) {
    Logger.step('Entering password...')
    if (password) {
      this.elements.passwordInput().clear().type(password)
      Logger.info('Password entered successfully')
    } else {
      Logger.error('Password is empty — cannot enter')
    }
  }

  clickLogin() {
    Logger.step('Clicking Login button')
    this.elements.loginButton().should('be.visible').click()
    Logger.info('Login button clicked successfully')
  }

  /**
   * Complete the login flow.
   * Assumes the login page is already open (call visitLoginPage() first).
   * @param {string} username — username or email
   * @param {string} password — account password
   */
  login(username, password) {
    Logger.step('Logging in...')
    this.fillUsername(username)
    this.fillPassword(password)
    this.clickLogin()
    Logger.info('Login submitted successfully')
  }

}

export default new LoginPage();
