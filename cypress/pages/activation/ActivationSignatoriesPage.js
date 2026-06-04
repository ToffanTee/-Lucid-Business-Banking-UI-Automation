import { Logger } from "../../utils/logger";

class ActivationSignatoriesPage {

  elements = {
    // --- Landing Page Elements ---
    stepHeader() {
      return cy.contains('Signatories')
    },

    noDataFoundMessage() {
      return cy.contains('No Data Found.')
    },

    addNewSignatoryLink() {
      return cy.contains('Add a new signatory')
    },

    continueButton() {
      return cy.contains('button', 'Continue')
    },

    // --- Add Signatory Form Elements ---
    addSignatoryHeader() {
      return cy.contains('Add new signatory')
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

    isDirectorCheckbox() {
      return cy.contains('Signatory is also a Director')
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
    Logger.step('Verifying Signatories page is displayed')
    this.elements.stepHeader().should('be.visible')
    Logger.info('Signatories page displayed successfully')
  }

  verifyNoDataFound() {
    Logger.step('Verifying No Data Found message is displayed')
    this.elements.noDataFoundMessage().should('be.visible')
    Logger.info('No Data Found message displayed successfully')
  }

  clickAddNewSignatory() {
    Logger.step('Clicking Add a new signatory link')
    this.elements.addNewSignatoryLink().should('be.visible').click()
    Logger.info('Add a new signatory link clicked successfully')
  }

  verifyAddSignatoryFormDisplayed() {
    Logger.step('Verifying Add new signatory form is displayed')
    this.elements.addSignatoryHeader().should('be.visible')
    Logger.info('Add new signatory form displayed successfully')
  }

  fillEmail(email) {
    Logger.step(`Entering signatory email: ${email}`)
    this.elements.emailInput().clear().type(email)
    Logger.info('Signatory email entered successfully')
  }

  fillFirstName(firstName) {
    Logger.step(`Entering signatory first name: ${firstName}`)
    this.elements.firstNameInput().clear().type(firstName)
    Logger.info('Signatory first name entered successfully')
  }

  selectRole(role) {
    Logger.step(`Selecting role: ${role}`)
    this.elements.roleDropdown().click()
    
    if (role) {
      cy.contains('mat-option', role).click()
    } else {
      // Fallback: select first option if none is passed
      this.elements.roleOptions().eq(0).click()
    }
    Logger.info('Role selected successfully')
  }

  toggleIsDirectorCheckbox(check = true) {
    Logger.step(`Toggling Signatory is also a Director checkbox to: ${check}`)
    // Click the checkbox label to toggle
    this.elements.isDirectorCheckbox().click()
    Logger.info('Signatory is also a Director checkbox toggled successfully')
  }

  fillSignatoryForm(email, firstName, role, isDirector = false) {
    Logger.step('Filling Add Signatory form details')
    this.fillEmail(email)
    this.fillFirstName(firstName)
    this.selectRole(role)
    if (isDirector) {
      this.toggleIsDirectorCheckbox(true)
    }
    Logger.info('Add Signatory form details filled')
  }

  clickNext() {
    Logger.step('Clicking Next button on Add Signatory form')
    this.elements.nextButton().should('be.visible').should('not.be.disabled').click()
    Logger.info('Next button clicked successfully')
  }

  clickGoBack() {
    Logger.step('Clicking Go back link')
    this.elements.goBackLink().should('be.visible').click()
    Logger.info('Go back link clicked successfully')
  }

  clickEditSignatory(firstName) {
    Logger.step(`Clicking Edit Signatory for: ${firstName}`)
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
    Logger.info('Edit Signatory clicked successfully')
  }

  clickContinue() {
    Logger.step('Clicking Continue button on Signatories landing page')
    this.elements.continueButton().should('be.visible').should('not.be.disabled').click()
    Logger.info('Continue button clicked successfully')
  }

}

export default new ActivationSignatoriesPage();
