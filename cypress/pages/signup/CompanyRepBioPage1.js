import { Logger } from "../../utils/logger";

class CompanyRepBioPage1 {

  elements = {
    stepHeader() {
      return cy.contains('Company Rep Bio (1/2)')
    },

    // Profile picture upload — the camera icon on the avatar circle
    // TODO: Update selector — use Selector Playground on the upload icon
    // profilePictureUpload() {
    //   return cy.get('.h-full')
    // },

    // Title dropdown
    // TODO: Update selector if needed
    titleDropdown() {
      return cy.get('#mat-select-value-3')
    },

    firstNameInput() {
      return cy.get(':nth-child(3) > app-custom-input > .input')
    },

    lastNameInput() {
      return cy.get(':nth-child(4) > app-custom-input > .input')
    },

    emailAddressInput() {
      return cy.get(':nth-child(5) > app-custom-input > .input')
    },

    // TODO: Update selector if needed — Phone number with +234 prefix
    phoneNumberInput() {
      return cy.get('#mat-input-2')
    },

    // TODO: Update selector if needed — Date of birth picker
    dateOfBirthInput() {
      return cy.get('#mat-input-3')
    },

    continueButton() {
      return cy.contains('button', 'Continue')
    }
  }

  // Page Actions
  verifyPageIsDisplayed() {
    Logger.step('Verifying Company Rep Bio (1/2) page is displayed')
    this.elements.stepHeader().should('be.visible')
    Logger.info('Company Rep Bio (1/2) page displayed successfully')
  }

  /**
   * Upload a profile picture.
   * @param {string} filePath — path to the image file relative to cypress/fixtures/
   */
  // uploadProfilePicture(filePath) {
  //   Logger.step('Uploading profile picture...')
  //   if (filePath) {
  //     this.elements.profilePictureUpload().selectFile(filePath, { force: true })
  //     Logger.info('Profile picture uploaded successfully')
  //   } else {
  //     Logger.error('No file path provided for profile picture')
  //   }
  // }

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

  fillFirstName(firstName) {
    Logger.step('Entering first name...')
    if (firstName) {
      this.elements.firstNameInput().clear().type(firstName)
      Logger.info('First name entered successfully')
    } else {
      Logger.error('First name is empty — cannot enter')
    }
  }

  fillLastName(lastName) {
    Logger.step('Entering last name...')
    if (lastName) {
      this.elements.lastNameInput().clear().type(lastName)
      Logger.info('Last name entered successfully')
    } else {
      Logger.error('Last name is empty — cannot enter')
    }
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

  /**
   * Enters phone number with the leading zero removed.
   * e.g. 09039182773 → 9039182773
   */
  fillPhoneNumber(phoneNumber) {
    Logger.step('Entering phone number...')
    if (phoneNumber) {
      const formattedNumber = phoneNumber.startsWith('0')
        ? phoneNumber.substring(1)
        : phoneNumber
      this.elements.phoneNumberInput().clear().type(formattedNumber)
      Logger.info(`Phone number entered: ${formattedNumber}`)
    } else {
      Logger.error('Phone number is empty — cannot enter')
    }
  }

  /**
   * Enters a date of birth in MM/DD/YYYY format.
   * Generates a random DOB between 25 and 55 years ago.
   */
  fillDateOfBirth() {
    Logger.step('Entering date of birth...')
    const today = new Date()
    const yearsAgo = Math.floor(Math.random() * 30) + 25
    const dob = new Date(today.getFullYear() - yearsAgo, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1)
    const month = String(dob.getMonth() + 1).padStart(2, '0')
    const day = String(dob.getDate()).padStart(2, '0')
    const year = dob.getFullYear()
    const formattedDate = `${month}/${day}/${year}`

    this.elements.dateOfBirthInput().clear().type(formattedDate)
    Logger.info(`Date of birth entered: ${formattedDate}`)
  }

  clickContinue() {
    Logger.step('Clicking Continue button on Company Rep Bio (1/2)')
    this.elements.continueButton().should('be.visible').click()
    Logger.info('Continue button clicked successfully')
  }

  /**
   * Complete the full Company Rep Bio (1/2) step.
   * @param {object} data — registration data from dataBuilder
   * @param {string} profilePicturePath — optional path to image in cypress/fixtures/
   */
  completeCompanyRepBio1(data, profilePicturePath) {
    Logger.step('Completing Company Rep Bio (1/2) step')
    this.verifyPageIsDisplayed()
    if (profilePicturePath) {
      this.uploadProfilePicture(profilePicturePath)
    }
    this.selectTitle(data.title)
    this.fillFirstName(data.firstName)
    this.fillLastName(data.lastName)
    this.fillEmailAddress(data.email)
    this.fillPhoneNumber(data.phoneNumber)
    this.fillDateOfBirth()
    this.clickContinue()
    Logger.info('Company Rep Bio (1/2) step completed')
  }

}

export default new CompanyRepBioPage1();
