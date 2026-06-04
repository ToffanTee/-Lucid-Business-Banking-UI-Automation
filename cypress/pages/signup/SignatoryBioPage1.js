import { Logger } from "../../utils/logger";

class InfoVerificationPage {

  elements = {
    stepHeader() {
      return cy.contains('create your banking profile')
    },

    // Profile picture upload — the camera icon on the avatar circle
    // TODO: Update selector — use Selector Playground on the upload icon
    profilePictureUpload() {
      return cy.get('.h-full')
    },

    // Title dropdown (requires input)
    // TODO: Update selector
    titleDropdown() {
      return cy.get('#mat-select-value-3')
    },

    // Prefilled fields — verify they have values
    firstNameInput() {
      return cy.get(':nth-child(3) > app-custom-input > .input')
    },

    lastNameInput() {
      return cy.get(':nth-child(4) > app-custom-input > .input')
    },

    // Email address (requires input)
    emailAddressInput() {
      return cy.get(':nth-child(5) > app-custom-input > .input')
    },

    // Prefilled fields
    phoneNumberInput() {
      return cy.get('#mat-input-0')
    },

    dateOfBirthInput() {
      return cy.get('#mat-input-1')
    },

    continueButton() {
      return cy.contains('button', 'Continue')
    }
  }

  // Page Actions
  verifyPageIsDisplayed() {
    Logger.step('Verifying Info Verification page — "Signatory Bio (1/2)" is displayed')
    this.elements.stepHeader().should('be.visible')
    Logger.info('Info Verification page displayed successfully')
  }

  /**
   * Verify that BVN-prefilled fields are not empty.
   * These fields are auto-populated and should not need manual input.
   */
  verifyPrefilledFields() {
    Logger.step('Verifying prefilled fields have values...')

    this.elements.firstNameInput().should('not.have.value', '')
    Logger.info('First name is prefilled')

    this.elements.lastNameInput().should('not.have.value', '')
    Logger.info('Last name is prefilled')

    this.elements.phoneNumberInput().should('not.have.value', '')
    Logger.info('Phone number is prefilled')

    this.elements.dateOfBirthInput().should('not.have.value', '')
    Logger.info('Date of birth is prefilled')
  }

  /**
   * Upload a profile picture.
   * @param {string} filePath — path to the image file relative to cypress/fixtures/
   */
  uploadProfilePicture(filePath) {
    Logger.step('Uploading profile picture...')
    if (filePath) {
      this.elements.profilePictureUpload().selectFile(filePath, { force: true })
      Logger.info('Profile picture uploaded successfully')
    } else {
      Logger.error('No file path provided for profile picture')
    }
  }

  /**
   * Select a title from the dropdown (e.g. Mr, Mrs, Miss, Dr).
   * @param {string} title — the title text to select
   */
  selectTitle(title) {
    Logger.step(`Selecting title: ${title}`)
    this.elements.titleDropdown().click()
    cy.get('.mdc-list-item__primary-text').contains(title).click()
    Logger.info(`Title "${title}" selected successfully`)
  }

  fillEmailAddress(email) {
    Logger.step('Entering email address...')
    if (email) {
      this.elements.emailAddressInput().clear().type(email)
      Logger.info('Email address entered successfully')
    } else {
      Logger.error('Email address is empty — cannot enter')
    }
  }

  clickContinue() {
    Logger.step('Clicking Continue button on Info Verification step')
    this.elements.continueButton().should('be.visible').click()
    Logger.info('Continue button clicked successfully')
  }

  /**
   * Complete the full Info Verification step.
   * @param {object} data — registration data from dataBuilder
   * @param {string} profilePicturePath — path to image in cypress/fixtures/
   */
  completeInfoVerification(data, profilePicturePath) {
    Logger.step('Completing Info Verification step')
    this.verifyPageIsDisplayed()
    this.verifyPrefilledFields()
    if (profilePicturePath) {
      this.uploadProfilePicture(profilePicturePath)
    }
    this.selectTitle(data.title)
    this.fillEmailAddress(data.email)
    this.clickContinue()
    Logger.info('Info Verification step completed')
  }

}

export default new InfoVerificationPage();
