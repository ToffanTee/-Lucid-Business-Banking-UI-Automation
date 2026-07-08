import { Logger } from "../../utils/logger";

/**
 * API base URL for transaction retrieval.
 * Used to intercept network calls for verifying infinite scroll and filter behaviour.
 */
const TRANSACTIONS_API_PATTERN = '**/lucid-customer/api/v1/account/process/transactions/retrieve-all**';

class TransactionsPage {

  elements = {
    transactionsHeader() {
      return cy.contains('Transactions')
    },

    /**
     * Search input for filtering transactions by narration/reference.
     */
    searchInput() {
      return cy.get('input[placeholder*="Search by narration"], input[placeholder*="search"], input[type="search"]')
        .filter(':visible')
    },

    /**
     * Filter trigger button — shows current filter label (e.g. "Last 2 months")
     * with a settings/tune icon. Clicking opens the filter panel overlay.
     */
    filterButton() {
      return cy.contains(/Last \d+ months?/i)
    },

    // --- Filter Panel Elements ---

    /**
     * The "Filter" panel header that appears when the filter overlay is open.
     */
    filterPanelHeader() {
      return cy.contains('Filter')
    },

    /**
     * "Date Option" accordion toggle in the filter panel.
     */
    dateOptionAccordion() {
      return cy.contains('Date Option')
    },

    /**
     * "Select Option" dropdown inside the Date Option accordion.
     * Contains preset date options: Last 2 months, This month, This week.
     */
    dateOptionDropdown() {
      return cy.contains('Select Option').parents('select, mat-select, .mat-mdc-select, .select-container, .dropdown')
        .first()
    },

    /**
     * "Date Range" accordion toggle in the filter panel.
     */
    dateRangeAccordion() {
      return cy.contains('Date Range')
    },

    /**
     * Start Date input field inside the Date Range accordion.
     * Format: MM/DD/YYYY
     */
    startDateInput() {
      return cy.contains('Start Date')
        .parents()
        .filter((index, el) => Cypress.$(el).find('input').length > 0)
        .first()
        .find('input')
    },

    /**
     * End Date input field inside the Date Range accordion.
     * Format: MM/DD/YYYY
     */
    endDateInput() {
      return cy.contains('End Date')
        .parents()
        .filter((index, el) => Cypress.$(el).find('input').length > 0)
        .first()
        .find('input')
    },

    /**
     * "Apply Search" button in the filter panel.
     */
    applySearchButton() {
      return cy.contains('Apply Search')
    },

    /**
     * "Reset" link in the filter panel to clear all filters.
     */
    resetButton() {
      return cy.contains('Reset')
    },

    // --- Table Headers ---
    dateColumnHeader() {
      return cy.contains('Date')
    },

    narrationColumnHeader() {
      return cy.contains('Narration')
    },

    amountColumnHeader() {
      return cy.contains('Amount')
    },

    // --- Table Body ---
    /**
     * Returns all visible transaction rows in the table.
     */
    transactionRows() {
      return cy.get('table tbody tr, .transaction-row, .transaction-item').filter(':visible')
    },

    // --- Loading & Empty States ---
    /**
     * Loading spinner shown during data fetch or infinite scroll.
     */
    loadingSpinner() {
      return cy.get('.spinner, .loading, mat-spinner, .mat-mdc-progress-spinner, [role="progressbar"]')
    },

    /**
     * Empty state message when no transactions are found.
     */
    emptyStateMessage() {
      return cy.contains('No Transaction Yet')
    },

    /**
     * Empty state subtext providing guidance.
     */
    emptyStateSubtext() {
      return cy.contains('Make A New Transfer, Bill Payment Or Airtime Recharge')
    },

    /**
     * Empty state icon/illustration (the piggy bank or empty box icon).
     */
    emptyStateIcon() {
      return cy.get('.empty-state img, .no-data img, .empty-icon').filter(':visible')
    }
  }

  // ——————————————————————————————————
  //  Page Verification
  // ——————————————————————————————————

  /**
   * Verify the Transactions section is visible with search, filter, and table headers.
   */
  verifyTransactionsSectionVisible() {
    Logger.step('Verifying Transactions section is visible')
    this.elements.transactionsHeader().should('be.visible')
    this.elements.searchInput().should('be.visible')
    this.elements.dateColumnHeader().should('be.visible')
    this.elements.narrationColumnHeader().should('be.visible')
    this.elements.amountColumnHeader().should('be.visible')
    Logger.info('Transactions section verified — search, filter, and table headers visible')
  }

  /**
   * Verify the empty state is shown when no transactions exist.
   * Asserts both the message and the guidance subtext are visible.
   */
  verifyEmptyState() {
    Logger.step('Verifying empty state is displayed')
    this.elements.emptyStateMessage().should('be.visible')
    this.elements.emptyStateSubtext().should('be.visible')
    Logger.info('Empty state verified — "No Transaction Yet" message visible')
  }

  // ——————————————————————————————————
  //  Search
  // ——————————————————————————————————

  /**
   * Search transactions by narration or reference text.
   * Types into the search input and waits for results to update.
   * @param {string} searchText — the narration/reference to search for
   */
  searchByNarration(searchText) {
    Logger.step(`Searching transactions by narration: "${searchText}"`)

    // Intercept the API call to wait for results
    cy.intercept('GET', TRANSACTIONS_API_PATTERN).as('searchTransactions')

    this.elements.searchInput().clear().type(searchText)

    // Wait for the API response (or a reasonable timeout if no request is made)
    cy.wait('@searchTransactions', { timeout: 15000 }).its('response.statusCode').should('be.oneOf', [200, 204])

    Logger.info(`Search completed for: "${searchText}"`)
  }

  /**
   * Search by narration without waiting for API — useful when there is no data
   * and the filtering is done client-side or no API call is triggered.
   * @param {string} searchText — the narration/reference to search for
   */
  searchByNarrationNoWait(searchText) {
    Logger.step(`Typing search text: "${searchText}"`)
    this.elements.searchInput().clear().type(searchText)
    // Allow debounce time for client-side filtering
    cy.wait(1000)
    Logger.info(`Search text entered: "${searchText}"`)
  }

  /**
   * Clear the search input field.
   */
  clearSearch() {
    Logger.step('Clearing search input')
    this.elements.searchInput().clear()
    cy.wait(500) // Allow debounce
    Logger.info('Search input cleared')
  }

  // ——————————————————————————————————
  //  Filters
  // ——————————————————————————————————

  /**
   * Click the filter button ("Last 2 months" label) to open the filter panel overlay.
   */
  clickFilterButton() {
    Logger.step('Opening filter panel')
    this.elements.filterButton().should('be.visible').click()
    this.elements.filterPanelHeader().should('be.visible')
    Logger.info('Filter panel opened')
  }

  /**
   * Verify the filter panel is visible with its core elements.
   */
  verifyFilterPanelVisible() {
    Logger.step('Verifying filter panel is visible')
    this.elements.filterPanelHeader().should('be.visible')
    this.elements.dateOptionAccordion().should('be.visible')
    this.elements.dateRangeAccordion().should('be.visible')
    this.elements.applySearchButton().should('be.visible')
    this.elements.resetButton().should('be.visible')
    Logger.info('Filter panel verified — Date Option, Date Range, Apply Search, and Reset visible')
  }

  /**
   * Expand the "Date Option" accordion in the filter panel.
   * Clicks the accordion header to reveal the dropdown.
   */
  expandDateOptionAccordion() {
    Logger.step('Expanding Date Option accordion')
    this.elements.dateOptionAccordion().click()
    Logger.info('Date Option accordion expanded')
  }

  /**
   * Select a preset date option from the "Date Option" dropdown.
   * Expands the accordion if needed, then selects the option.
   * @param {'Last 2 months' | 'This month' | 'This week'} option — the preset to select
   */
  selectDateOption(option) {
    Logger.step(`Selecting date option: "${option}"`)

    // Click the "Select Option" dropdown to open it
    cy.contains('Select Option').scrollIntoView().click({ force: true })

    // Select the option from the dropdown list
    cy.contains(option).scrollIntoView().click({ force: true })

    Logger.info(`Date option selected: "${option}"`)
  }

  /**
   * Expand the "Date Range" accordion in the filter panel.
   * Clicks the accordion header to reveal Start Date and End Date inputs.
   */
  expandDateRangeAccordion() {
    Logger.step('Expanding Date Range accordion')
    this.elements.dateRangeAccordion().scrollIntoView().click({ force: true })
    Logger.info('Date Range accordion expanded')
  }

  /**
   * Set the Start Date in the Date Range filter.
   * Assumes the Date Range accordion is already expanded.
   * @param {string} date — date string in MM/DD/YYYY format (e.g. '01/01/2026')
   */
  setStartDate(date) {
    Logger.step(`Setting start date: ${date}`)
    this.elements.startDateInput().scrollIntoView().click({ force: true }).clear({ force: true }).type(date, { force: true })
    Logger.info(`Start date set: ${date}`)
  }

  /**
   * Set the End Date in the Date Range filter.
   * Assumes the Date Range accordion is already expanded.
   * @param {string} date — date string in MM/DD/YYYY format (e.g. '06/10/2026')
   */
  setEndDate(date) {
    Logger.step(`Setting end date: ${date}`)
    this.elements.endDateInput().scrollIntoView().click({ force: true }).clear({ force: true }).type(date, { force: true })
    Logger.info(`End date set: ${date}`)
  }

/**
 * Scroll to the transaction filter area before opening the filter panel.
 */
scrollToFilterButton() {
  Logger.step('Scrolling to filter button')

  cy.scrollTo('bottom')

  Logger.info('Scrolled to filter button area')
}
  
  /**
   * Apply a custom date range filter using Start Date and End Date inputs.
   * Opens the Date Range accordion, fills in dates, and clicks Apply Search.
   * @param {string} startDate — start date in MM/DD/YYYY format
   * @param {string} endDate — end date in MM/DD/YYYY format
   */
  
  applyDateRangeFilter(startDate, endDate) {
    Logger.step(`Applying date range filter: ${startDate} to ${endDate}`)

    this.scrollToFilterButton()


    // Expand the Date Range accordion
    this.expandDateRangeAccordion()

    // Fill in the date inputs
    this.setStartDate(startDate)
    this.setEndDate(endDate)

    // Click Apply Search
    this.clickApplySearch()

    Logger.info(`Date range filter applied: ${startDate} — ${endDate}`)
  }

  /**
   * Apply a preset date option filter.
   * Opens the Date Option accordion, selects the option, and clicks Apply Search.
   * @param {'Last 2 months' | 'This month' | 'This week'} option — the preset to select
   */
  applyDateOptionFilter(option) {
    Logger.step(`Applying date option filter: "${option}"`)

    // Expand the Date Option accordion
    this.expandDateOptionAccordion()

    // Select the option
    this.selectDateOption(option)

    // Click Apply Search
    this.clickApplySearch()

    Logger.info(`Date option filter applied: "${option}"`)
  }

  /**
   * Click the "Apply Search" button in the filter panel.
   */
  clickApplySearch() {
    Logger.step('Clicking Apply Search button')
    this.elements.applySearchButton().scrollIntoView().click({ force: true })
    Logger.info('Apply Search clicked')
  }

  /**
   * Click the "Reset" link in the filter panel to clear all filters.
   */
  clickReset() {
    Logger.step('Clicking Reset to clear all filters')
    this.elements.resetButton().scrollIntoView().click({ force: true })
    Logger.info('Filters reset')
  }

  /**
   * Verify that applying a filter does NOT trigger a full page reload.
   * Sets up a navigation spy before the filter action.
   * Call this BEFORE triggering the filter.
   * @returns {string} — the alias name to check after filtering
   */
  setupNoReloadAssertion() {
    Logger.step('Setting up no-reload assertion')
    // Intercept any full-page navigation (document requests)
    cy.intercept('GET', '**/app/accounts/**', (req) => {
      // Let the request continue, we just want to observe
      req.continue()
    }).as('pageNavigation')

    // Store the current URL to compare later
    cy.url().as('urlBeforeFilter')
    Logger.info('No-reload assertion ready')
  }

  /**
   * Assert that no full page reload occurred after a filter action.
   * Call this AFTER the filter has been applied.
   */
  verifyNoFullPageReload() {
    Logger.step('Verifying no full page reload occurred')
    cy.get('@urlBeforeFilter').then(urlBefore => {
      cy.url().should('eq', urlBefore)
    })
    Logger.info('Confirmed: no full page reload — results updated in-place')
  }

  // ——————————————————————————————————
  //  Infinite Scroll
  // ——————————————————————————————————

  /**
   * Scroll to the bottom of the transactions list to trigger infinite scroll.
   * Intercepts the pagination API call to verify loading behaviour.
   */
  scrollToLoadMore() {
    Logger.step('Scrolling to bottom to trigger infinite scroll')

    // Intercept the next page API call
    cy.intercept('GET', TRANSACTIONS_API_PATTERN).as('loadMoreTransactions')

    // Scroll the transactions container to the bottom
    cy.get('.transactions-container, .transaction-list, .table-container, .cdk-virtual-scroll-viewport')
      .filter(':visible')
      .first()
      .scrollTo('bottom')

    Logger.info('Scrolled to bottom — waiting for next page to load')
  }

  /**
   * Verify the loading spinner is shown during a data fetch.
   * This is typically used after triggering infinite scroll.
   */
  verifyLoadingSpinner() {
    Logger.step('Verifying loading spinner is visible during fetch')
    this.elements.loadingSpinner().should('exist')
    Logger.info('Loading spinner confirmed visible')
  }

  /**
   * Verify that new transaction rows were appended after infinite scroll.
   * @param {number} previousCount — the row count before scrolling
   */
  verifyMoreRowsLoaded(previousCount) {
    Logger.step(`Verifying more rows loaded (previous count: ${previousCount})`)
    this.elements.transactionRows().should('have.length.greaterThan', previousCount)
    Logger.info('Confirmed: additional rows loaded via infinite scroll')
  }

  // ——————————————————————————————————
  //  Transaction Row Assertions
  // ——————————————————————————————————

  /**
   * Verify the exact number of visible transaction rows.
   * @param {number} expectedCount — the expected row count
   */
  verifyTransactionRowCount(expectedCount) {
    Logger.step(`Verifying transaction row count is ${expectedCount}`)
    this.elements.transactionRows().should('have.length', expectedCount)
    Logger.info(`Transaction row count verified: ${expectedCount}`)
  }

  /**
   * Verify a transaction row at a given index contains the expected text.
   * @param {number} rowIndex — 0-based row index
   * @param {string} expectedText — text that should appear in the row
   */
  verifyTransactionRowContains(rowIndex, expectedText) {
    Logger.step(`Verifying row ${rowIndex} contains: "${expectedText}"`)
    this.elements.transactionRows().eq(rowIndex).should('contain.text', expectedText)
    Logger.info(`Row ${rowIndex} contains "${expectedText}"`)
  }
}

export default new TransactionsPage();
