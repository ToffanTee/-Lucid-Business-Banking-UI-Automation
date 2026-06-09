import { Logger } from "../../utils/logger";

class CreateProfilePage {

  elements = {
    stepHeader() {
      return cy.contains('Create your profile')
    },


    usernameInput() {
      return cy.get('app-custom-input').eq(0).find('.input')
    },
    passwordInput() {
      return cy.get('app-custom-input').eq(1).find('.input')
    },

    confirmPasswordInput() {
      return cy.get('app-custom-input').eq(2).find('.input')
    },

    // TODO: Update selector — Create Account / Submit button
    createAccountButton() {
      return cy.contains('button', 'Continue')
    },

    successMessage() {
      return cy.contains('Congratulations! Your profile has been created Successfully')
    }
  }

  // Page Actions
  verifyPageIsDisplayed() {
    Logger.step('Verifying Create Profile step is displayed')
    this.elements.stepHeader().should('be.visible')
    Logger.info('Create Profile step displayed successfully')
  }

  fillUsername(username) {
    Logger.step('Entering username...')
    if (username) {
      this.elements.usernameInput().clear().type(username, { delay: 50 })
      Logger.info('Username entered successfully')
    } else {
      Logger.error('Username is empty — cannot enter')
    }
  }

  fillPassword(password) {
    Logger.step('Entering password...')
    if (password) {
      this.elements.passwordInput().clear().type(password, { delay: 50 })
      Logger.info('Password entered successfully')
    } else {
      Logger.error('Password is empty — cannot enter')
    }
  }

  fillConfirmPassword(confirmPassword, password) {
    Logger.step('Confirming password...')
    if (password && confirmPassword !== password) {
      Logger.error(`Password mismatch — password: "${password}" vs confirmPassword: "${confirmPassword}"`)
      throw new Error('Password and Confirm Password do not match')
    }
    if (confirmPassword) {
      this.elements.confirmPasswordInput().clear().type(confirmPassword, { delay: 50 })
      Logger.info('Confirm password entered successfully')
    } else {
      Logger.error('Confirm password is empty — cannot enter')
    }
  }

  clickContinue() {
    Logger.step('Clicking Continue button')
    this.elements.createAccountButton().should('be.visible').click()
    Logger.info('Continue button clicked successfully')
  }

  verifyAccountCreated() {
    Logger.step('Verifying account was created successfully')
    this.elements.successMessage().should('be.visible')
    Logger.info('Account created successfully!')
  }

  completeProfileCreation(data) {
    Logger.step('Completing Create Profile step')
    this.verifyPageIsDisplayed()
    this.fillUsername(data.username)
    this.fillPassword(data.password)
    this.fillConfirmPassword(data.confirmPassword || data.password, data.password)
    this.clickContinue()
    Logger.info('Create Profile step completed')
  }

}

export default new CreateProfilePage();
