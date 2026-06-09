import { Logger } from "../../utils/logger";

class ActivationDirectorIdPage {

  elements = {
    stepHeader() {
      return cy.contains('Director Identification')
    },

    addMoreLink() {
      return cy.contains('add more means of ID')
    },

    continueButton() {
      return cy.contains('button', 'Continue')
    }
  }

  verifyPageIsDisplayed() {
    Logger.step('Verifying Director Identification page is displayed')
    this.elements.stepHeader().should('be.visible')
    Logger.info('Director Identification page displayed successfully')
  }

  getSection(sectionIndex) {
    return cy.get('input[type="file"]').eq(sectionIndex).then(($fileInput) => {
      let container = $fileInput.parent();
      while (container.length && container.find('mat-radio-button, .mat-mdc-radio-button').length === 0) {
        container = container.parent();
      }
      return cy.wrap(container);
    });
  }

  selectIdType(sectionIndex, type) {
    Logger.step(`Selecting ID Type for section ${sectionIndex}: ${type}`)
    const optionText = type.toLowerCase() === 'expiry' ? 'Expiry' : 'Non Expiry'
    const exactRegex = new RegExp(`^\\s*${optionText}\\s*$`)
    this.getSection(sectionIndex).then(($section) => {
      cy.wrap($section).find('mat-radio-button, .mat-mdc-radio-button, label').contains(exactRegex).click()
    })
    Logger.info(`ID Type "${type}" selected`)
  }

  selectMeansOfId(sectionIndex, optionText) {
    Logger.step(`Selecting Means of ID for section ${sectionIndex}: ${optionText}`)
    this.getSection(sectionIndex).then(($section) => {
      cy.wrap($section).find('mat-select').eq(0).click()
      cy.get('.mdc-list-item__primary-text, mat-option').should('be.visible')
      if (optionText) {
        cy.get('.mdc-list-item__primary-text, mat-option').contains(optionText).click()
      } else {
        cy.get('.mdc-list-item__primary-text, mat-option').eq(0).click()
      }
    })
    Logger.info(`Means of ID "${optionText}" selected`)
  }

  fillIdNumber(sectionIndex, idNumber) {
    Logger.step(`Entering ID Number for section ${sectionIndex}: ${idNumber}`)
    this.getSection(sectionIndex).then(($section) => {
      cy.wrap($section).find('input[placeholder="Enter id number"]').clear().type(idNumber)
    })
    Logger.info('ID Number entered successfully')
  }

  fillIssueDate(sectionIndex, dateStr) {
    Logger.step(`Entering Issue Date for section ${sectionIndex}: ${dateStr}`)
    this.getSection(sectionIndex).then(($section) => {
      cy.wrap($section).find('input[placeholder="MM/DD/YYYY"]').eq(0).clear().type(dateStr)
    })
    Logger.info('Issue Date entered successfully')
  }

  fillExpiryDate(sectionIndex, dateStr) {
    Logger.step(`Entering Expiry Date for section ${sectionIndex}: ${dateStr}`)
    this.getSection(sectionIndex).then(($section) => {
      cy.wrap($section).find('input[placeholder="MM/DD/YYYY"]').eq(1).clear().type(dateStr)
    })
    Logger.info('Expiry Date entered successfully')
  }

  selectIssuingCountry(sectionIndex, countryName) {
    Logger.step(`Selecting Issuing country for section ${sectionIndex}: ${countryName || 'Nigeria'}`)
    this.getSection(sectionIndex).then(($section) => {
      cy.wrap($section).find('mat-select').eq(1).click()
      cy.get('.mdc-list-item__primary-text, mat-option').should('be.visible')
      if (countryName) {
        cy.get('.mdc-list-item__primary-text, mat-option').contains(countryName).click()
      } else {
        cy.get('.mdc-list-item__primary-text, mat-option').contains('Nigeria').click()
      }
    })
    Logger.info('Issuing country selected successfully')
  }

  uploadDocument(sectionIndex) {
    Logger.step(`Uploading document for section ${sectionIndex}`)
    const fileSize = 1 * 1024 * 1024; // 1 MB
    const buffer = Cypress.Buffer.alloc(fileSize, 'a');
    this.getSection(sectionIndex).then(($section) => {
      cy.wrap($section).find('input[type="file"]').selectFile({
        contents: buffer,
        fileName: 'director_id.pdf',
        mimeType: 'application/pdf',
      }, { force: true })
    })
    Logger.info('Document uploaded successfully')
  }

  clickAddMore() {
    Logger.step('Clicking "+ add more means of ID" link')
    this.elements.addMoreLink().should('be.visible').click()
    Logger.info('Add more link clicked successfully')
  }

  clickContinue() {
    Logger.step('Clicking Continue button on Director Identification page')
    this.elements.continueButton().should('be.visible').should('not.be.disabled').click()
    Logger.info('Continue button clicked successfully')
  }
}

export default new ActivationDirectorIdPage();
