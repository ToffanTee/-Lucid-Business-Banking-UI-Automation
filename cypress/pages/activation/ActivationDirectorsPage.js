import { Logger } from "../../utils/logger";

class ActivationDirectorsPage {

  elements = {
    // --- Landing Page Elements ---
    stepHeader() {
      return cy.contains('Directors')
    },

    noDataFoundMessage() {
      return cy.contains('No Data Found.')
    },

    addNewDirectorLink() {
      return cy.contains('Add a new director')
    },

    continueButton() {
      return cy.contains('button', 'Continue')
    },

    // --- Add Director Form Elements ---
    addDirectorHeader() {
      return cy.contains('Add new director')
    },

    emailInput() {
      return cy.get('app-custom-input').eq(0).find('.input')
    },

    firstNameInput() {
      return cy.get('app-custom-input').eq(1).find('.input')
    },

    roleDropdown() {
      return cy.get('mat-select').eq(0)
    },

    roleOptions() {
      return cy.get('mat-option')
    },

    nextButton() {
      return cy.contains('button', 'Next')
    },

    goBackLink() {
      return cy.contains('Go back')
    }
  }

  // Page Actions
  verifyPageIsDisplayed() {
    Logger.step('Verifying Directors page is displayed')
    this.elements.stepHeader().should('be.visible')
    Logger.info('Directors page displayed successfully')
  }

  verifyNoDataFound() {
    Logger.step('Verifying No Data Found message is displayed')
    this.elements.noDataFoundMessage().should('be.visible')
    Logger.info('No Data Found message displayed successfully')
  }

  clickAddNewDirector() {
    Logger.step('Clicking Add a new director link')
    this.elements.addNewDirectorLink().should('be.visible').click()
    Logger.info('Add a new director link clicked successfully')
  }

  verifyAddDirectorFormDisplayed() {
    Logger.step('Verifying Add new director form is displayed')
    this.elements.emailInput().should('be.visible')
    Logger.info('Add new director form displayed successfully')
  }

  fillEmail(email) {
    Logger.step(`Entering director email: ${email}`)
    this.elements.emailInput().clear().type(email)
    Logger.info('Director email entered successfully')
  }

  fillFirstName(firstName) {
    Logger.step(`Entering director first name: ${firstName}`)
    this.elements.firstNameInput().clear().type(firstName)
    Logger.info('Director first name entered successfully')
  }

  selectRole(role) {
    Logger.step(`Selecting role: ${role}`)
    this.elements.roleDropdown().click()
    
    if (role) {
      cy.contains('mat-option', role).click()
    } else {
      this.elements.roleOptions().eq(0).click()
    }
    Logger.info('Role selected successfully')
  }

  fillDirectorForm(email, firstName, role) {
    Logger.step('Filling Add Director form details')
    this.fillEmail(email)
    this.fillFirstName(firstName)
    this.selectRole(role)
    Logger.info('Add Director form details filled')
  }

  clickNext() {
    Logger.step('Clicking Next button on Add Director form')
    this.elements.nextButton().should('be.visible').should('not.be.disabled').click()
    Logger.info('Next button clicked successfully')
  }

  clickGoBack() {
    Logger.step('Clicking Go back link')
    this.elements.goBackLink().should('be.visible').click()
    Logger.info('Go back link clicked successfully')
  }

  clickEditDirector(firstName) {
    Logger.step(`Clicking Edit Director for: ${firstName}`)
    cy.contains(firstName).should('be.visible').then(($el) => {
      let parent = $el;
      while (parent.length && parent.find('img, svg, button, mat-icon').length === 0) {
        parent = parent.parent();
      }
      const editBtn = parent.find('[class*="edit"], [id*="edit"], img[src*="edit"], svg[class*="edit"], mat-icon');
      if (editBtn.length) {
        cy.wrap(editBtn.first()).click();
      } else {
        cy.wrap(parent.find('img, svg, button').first()).click();
      }
    });
    Logger.info('Edit Director clicked successfully')
  }

  clickContinue() {
    Logger.step('Clicking Continue button on Directors landing page')
    cy.wait(1000)
    this.elements.continueButton().should('be.visible').click({ force: true })
    Logger.info('Continue button clicked successfully')
  }

  clickAddDirector() {
    Logger.step('Clicking add director link')
    cy.wait(1000)
    cy.get('body').then($body => {
      const bodyText = $body.text()
      if (bodyText.includes('Add a new director')) {
        cy.contains('Add a new director').should('be.visible').click({ force: true })
      } else {
        cy.contains('Add another director').should('be.visible').click({ force: true })
      }
    })
    Logger.info('Add director link clicked successfully')
  }

  clickEditOnFirstMissingInfoDirector() {
    Logger.step('Clicking edit on first director with Missing Info')
    cy.contains('Missing Info').first().should('be.visible').then(($el) => {
      this._clickEditOnDirectorCard($el)
    })
    Logger.info('Edit icon clicked on director with Missing Info')
  }

  clickEditOnFirstPendingDirector() {
    Logger.step('Clicking edit on first director with Documents Pending')
    cy.contains('Documents Pending').first().should('be.visible').then(($el) => {
      this._clickEditOnDirectorCard($el)
    })
    Logger.info('Edit icon clicked on director with Documents Pending')
  }

  _clickEditOnDirectorCard($el) {
    let $card = $el
    let foundCard = false
    for (let i = 0; i < 20; i++) {
      $card = $card.parent()
      const cardText = $card.text()
      if (
        cardText.includes('Remove director') ||
        cardText.includes('Add a new director') ||
        cardText.includes('Add another director') ||
        cardText.includes('Director') && $card.find('img, svg, mat-icon').length > 0
      ) {
        foundCard = true
        break
      }
    }

    const editBtn = $card.find('[class*="edit"], [id*="edit"], img[src*="edit"], svg[class*="edit"], mat-icon')
    if (editBtn.length > 0) {
      cy.wrap(editBtn.first()).click({ force: true })
      return
    }

    const imgSvg = $card.find('img, svg')
    if (imgSvg.length > 0) {
      cy.wrap(imgSvg.first()).click({ force: true })
      return
    }

    Logger.step('Fallback: clicking first edit icon on page')
    cy.get('img, svg, mat-icon').filter(':visible').first().click({ force: true })
  }

}

export default new ActivationDirectorsPage();
