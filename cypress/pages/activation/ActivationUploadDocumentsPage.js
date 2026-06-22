import { Logger } from "../../utils/logger";

class ActivationUploadDocumentsPage {

  elements = {
    stepHeader() {
      return cy.contains('Upload documents below to proceed')
    },

    continueButton() {
      return cy.contains('button', 'Continue')
    }
  }

  verifyPageIsDisplayed() {
    Logger.step('Verifying Upload Documents page is displayed')
    this.elements.stepHeader().should('be.visible')
    Logger.info('Upload Documents page displayed successfully')
  }

  selectUniqueDocumentType(index, selectedTypes) {
    Logger.step(`Selecting unique document type for dropdown index ${index}`)
    // Scroll the trigger into view first so the CDK overlay panel renders
    // within the visible viewport and is not clipped by fixed-position ancestors
    cy.get('mat-select').eq(index).scrollIntoView().click({ force: true })
    cy.wait(1000) // Wait for dropdown options to render

    // mat-option elements live inside a position:fixed CDK overlay — they exist
    // in the DOM but Cypress flags them as not visible. Use 'exist' + scrollIntoView.
    cy.get('.mdc-list-item__primary-text, mat-option').should('exist').then(($options) => {
      let optionToClick = null;
      let selectedText = '';

      for (let j = 0; j < $options.length; j++) {
        const text = $options.eq(j).text().trim();
        if (text && text !== 'Select document' && !selectedTypes.includes(text)) {
          optionToClick = $options.eq(j);
          selectedText = text;
          break;
        }
      }

      // Fallback if no unique option is found
      if (!optionToClick) {
        optionToClick = $options.eq(0);
        selectedText = $options.eq(0).text().trim();
      }

      selectedTypes.push(selectedText);
      Logger.info(`Selecting document type: "${selectedText}"`)
      cy.wrap(optionToClick).scrollIntoView().click({ force: true })
    })
  }

  getSectionContainer(index) {
    return cy.get('mat-select').eq(index).then(($select) => {
      let container = $select.parent();
      while (container.length) {
        const hasFileInput = container.find('input[type="file"]').length > 0;
        const hasRemoveButton = container.text().includes('Remove') || container.find('button:contains("Remove")').length > 0;
        
        if (hasFileInput || hasRemoveButton) {
          break;
        }
        container = container.parent();
      }
      return cy.wrap(container);
    });
  }

  uploadDocument(index) {
    Logger.step(`Uploading document file for section index ${index}`)
    const fileSize = 1 * 1024 * 1024; // 1 MB
    const buffer = Cypress.Buffer.alloc(fileSize, 'a');
    
    this.getSectionContainer(index).then(($container) => {
      cy.wrap($container).find('input[type="file"]').selectFile({
        contents: buffer,
        fileName: `activation_document_${index}.pdf`,
        mimeType: 'application/pdf',
      }, { force: true })
    });
    
    Logger.info(`Document uploaded successfully for section index ${index}`)
  }

  clickContinue() {
    Logger.step('Clicking Continue button on Upload Documents page')
    cy.wait(1000)
    this.elements.continueButton().should('be.visible').click({ force: true })
    Logger.info('Continue button clicked successfully')
  }

  completeUploadsRecursively(index, count, selectedTypes) {
    if (index >= count) {
      Logger.info('All document upload fields processed')
      this.clickContinue()
      return
    }

    this.getSectionContainer(index).then(($container) => {
      const hasFileInput = $container.find('input[type="file"]').length > 0;

      if (!hasFileInput) {
        Logger.info(`Section index ${index} already has a document uploaded. Skipping upload.`)
        // Record the selected dropdown text to prevent duplicates in other dropdowns
        cy.wrap($container).find('mat-select').then(($select) => {
          const text = $select.text().trim()
          if (text) {
            selectedTypes.push(text)
          }
        })

        // Continue to the next section
        cy.then(() => {
          this.completeUploadsRecursively(index + 1, count, selectedTypes)
        })
      } else {
        // Section is empty, select unique type and upload file
        this.selectUniqueDocumentType(index, selectedTypes)
        this.uploadDocument(index)
        cy.wait(1000) // Allow UI to process after upload

        // Chain the next recursive iteration
        cy.then(() => {
          this.completeUploadsRecursively(index + 1, count, selectedTypes)
        })
      }
    })
  }

  completeUploadDocuments() {
    Logger.step('Completing dynamic document uploads step')
    cy.wait(3000) // Give the uploads page time to fully load and API calls to complete
    this.verifyPageIsDisplayed()

    cy.get('mat-select').then(($selects) => {
      const count = $selects.length
      Logger.info(`Found ${count} document upload dropdowns on the page`)
      const selectedTypes = []
      this.completeUploadsRecursively(0, count, selectedTypes)
    })
  }

}

export default new ActivationUploadDocumentsPage();
