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
    this.elements.emailInput().should('be.visible')
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

  toggleIsDirectorCheckbox() {
    Logger.step('Toggling Signatory is also a Director checkbox')
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
      this.toggleIsDirectorCheckbox()
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
    cy.wait(1000)
    this.elements.continueButton().should('be.visible').click({ force: true })
    Logger.info('Continue button clicked successfully')
  }

  /**
   * Flexible add signatory — handles both "Add a new signatory"
   * (when no signatories exist) and "Add another signatory"
   * (when signatories already exist on the page).
   */
  clickAddSignatory() {
    Logger.step('Clicking add signatory link')
    cy.wait(1000) // Ensure page settled and event handlers registered
    cy.get('body').then($body => {
      const bodyText = $body.text()
      if (bodyText.includes('Add a new signatory')) {
        cy.contains('Add a new signatory').should('be.visible').click({ force: true })
      } else {
        cy.contains('Add another signatory').should('be.visible').click({ force: true })
      }
    })
    Logger.info('Add signatory link clicked successfully')
  }

  /**
   * Click the edit pencil icon on the first signatory card that has a
   * "Missing Info" banner. Traverses up the DOM from the banner text
   * to the card container, then locates the edit icon within it.
   */
  clickEditOnFirstMissingInfoSignatory() {
    Logger.step('Clicking edit on first signatory with Missing Info')
    cy.contains('Missing Info').first().should('be.visible').then(($el) => {
      this._clickEditOnSignatoryCard($el)
    })
    Logger.info('Edit icon clicked on signatory with Missing Info')
  }

  /**
   * Click the edit pencil icon on the first signatory card that has a
   * "Documents Pending" banner. Same traversal logic as Missing Info.
   */
  clickEditOnFirstPendingSignatory() {
    Logger.step('Clicking edit on first signatory with Documents Pending')
    cy.contains('Documents Pending').first().should('be.visible').then(($el) => {
      this._clickEditOnSignatoryCard($el)
    })
    Logger.info('Edit icon clicked on signatory with Documents Pending')
  }

  /**
   * Shared helper: given a jQuery element inside a signatory card,
   * walk up the DOM to find the card container and click the edit icon.
   * Uses multiple boundary markers since not all card types have "Remove signatory".
   */
  _clickEditOnSignatoryCard($el) {
    // Strategy 1: Walk up from the status text to find the card container.
    // Stop at any known card boundary marker.
    let $card = $el
    let foundCard = false
    for (let i = 0; i < 20; i++) {
      $card = $card.parent()
      // Check multiple possible card boundary markers
      const cardText = $card.text()
      if (
        cardText.includes('Remove signatory') ||
        cardText.includes('Add a new signatory') ||
        cardText.includes('Add another signatory') ||
        cardText.includes('Signatory') && $card.find('img, svg, mat-icon').length > 0
      ) {
        foundCard = true
        break
      }
    }

    // Within the card, find the edit icon (pencil)
    const editBtn = $card.find('[class*="edit"], [id*="edit"], img[src*="edit"], svg[class*="edit"], mat-icon')
    if (editBtn.length > 0) {
      cy.wrap(editBtn.first()).click({ force: true })
      return
    }

    // Fallback: find the first clickable img/svg in the card
    const imgSvg = $card.find('img, svg')
    if (imgSvg.length > 0) {
      cy.wrap(imgSvg.first()).click({ force: true })
      return
    }

    // Last resort: click the edit pencil icon anywhere on the page
    // (works when there is only one signatory card)
    Logger.step('Fallback: clicking first edit icon on page')
    cy.get('img, svg, mat-icon').filter(':visible').first().click({ force: true })
  }

}

export default new ActivationSignatoriesPage();
