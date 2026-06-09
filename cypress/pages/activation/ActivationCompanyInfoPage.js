import { Logger } from "../../utils/logger";

class ActivationCompanyInfoPage {

  elements = {
    stepHeader() {
      return cy.contains('Company information')
    },

    activeTab() {
      return cy.contains('Company Info')
    },

    companyNameInput() {
      // Find the first app-custom-input element's input
      return cy.get('app-custom-input').eq(0).find('.input')
    },

    companyEmailInput() {
      // Find the second app-custom-input element's input
      return cy.get('app-custom-input').eq(1).find('.input')
    },

    registrationNumberInput() {
      // Find the third app-custom-input element's input
      return cy.get('app-custom-input').eq(2).find('.input')
    },

    tinInput() {
      // Find the fourth app-custom-input element's input
      return cy.get('app-custom-input').eq(3).find('.input')
    },

    registrationDateInput() {
      // Let's locate the fifth custom input or a datepicker input
      return cy.get('app-custom-input').eq(4).find('.input')
    },

    businessCategoryDropdown() {
      // Locate the mat-select dropdown
      return cy.get('mat-select').eq(0)
    },

    businessCategoryOptions() {
      return cy.get('mat-option')
    },

    continueButton() {
      // The button text is "Next" on activation screen (fallback to "Continue")
      return cy.contains('button', /Next|Continue/i)
    }
  }

  // Page Actions
  verifyPageIsDisplayed() {
    Logger.step('Verifying Company Information activation page is displayed')
    this.elements.stepHeader().should('be.visible')
    this.elements.activeTab().should('be.visible')
    Logger.info('Company Information activation page displayed successfully')
  }

  verifyPreFilledFields(data) {
    Logger.step('Verifying that Company Information fields are pre-filled correctly')
    
    if (data.companyName) {
      this.elements.companyNameInput().should('have.value', data.companyName)
      Logger.info(`Company Name pre-filled correctly: ${data.companyName}`)
    }
    
    if (data.companyEmail) {
      this.elements.companyEmailInput().should('have.value', data.companyEmail)
      Logger.info(`Company Email pre-filled correctly: ${data.companyEmail}`)
    }
    
    if (data.registrationNumber) {
      const expectedReg = data.registrationNumber.startsWith('RC')
        ? data.registrationNumber.substring(2)
        : data.registrationNumber
      this.elements.registrationNumberInput().should('have.value', expectedReg)
      Logger.info(`CAC/Registration Number pre-filled correctly: ${expectedReg}`)
    }
    
    if (data.tin) {
      this.elements.tinInput().should('have.value', data.tin)
      Logger.info(`TIN pre-filled correctly: ${data.tin}`)
    }
  }

  selectBusinessCategory() {
    Logger.step('Selecting a random business category...')
    this.elements.businessCategoryDropdown().click()
    cy.wait(1000) // Allow dropdown option list to render and animate
    this.elements.businessCategoryOptions()
      .should('have.length.greaterThan', 0)
      .then(($options) => {
        const randomIndex = Math.floor(Math.random() * $options.length)
        this.elements.businessCategoryOptions().eq(randomIndex).click({ force: true })
      })
    Logger.info('Business category selected successfully')
  }

  fillRegistrationDate(formattedDate) {
    Logger.step(`Entering registration date: ${formattedDate}`)
    this.elements.registrationDateInput().clear().type(formattedDate)
    Logger.info('Registration date entered successfully')
  }

  /**
   * Generates and fills a random registration date (e.g. 5 years ago)
   */
  fillRandomRegistrationDate() {
    Logger.step('Generating random registration date...')
    const today = new Date()
    const yearsAgo = Math.floor(Math.random() * 5) + 1
    const pastDate = new Date(today.getFullYear() - yearsAgo, 0, 1)
    const month = String(pastDate.getMonth() + 1).padStart(2, '0')
    const day = String(pastDate.getDate()).padStart(2, '0')
    const year = pastDate.getFullYear()
    
    // Support either MM/DD/YYYY or YYYY-MM-DD input format depending on type="date" vs text input
    this.elements.registrationDateInput().then(($el) => {
      const isDateType = $el.attr('type') === 'date'
      const formattedDate = isDateType ? `${year}-${month}-${day}` : `${month}/${day}/${year}`
      this.fillRegistrationDate(formattedDate)
    })
  }

  clickContinue() {
    Logger.step('Clicking Next/Continue button on Company Info activation page')
    this.elements.continueButton().should('be.visible').should('not.be.disabled').click()
    Logger.info('Next/Continue button clicked successfully')
  }

}

export default new ActivationCompanyInfoPage();
