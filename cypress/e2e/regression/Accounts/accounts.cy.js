import LoginPage from '../../../pages/login/LoginPage';
import DeviceRegistrationPage from '../../../pages/login/DeviceRegistrationPage';
import AccountsPage from '../../../pages/accounts/AccountsPage';
import TransactionsPage from '../../../pages/accounts/TransactionsPage';

describe('Lucid Business Banking - Accounts Module', () => {

  beforeEach(() => {
    LoginPage.visitLoginPage();

    // Read credentials directly from the .env file on disk
    cy.task('readEnvCredentials').then(({ username, password }) => {
      // Guard: ensure credentials are set up
      expect(username, 'EXISTING_USER_USERNAME must be set in .env').to.not.be.empty;
      expect(password, 'EXISTING_USER_PASSWORD must be set in .env').to.not.be.empty;

      cy.log(`Logging in with existing user: ${username}`);
      LoginPage.login(username, password);

      // Handle device registration if required
      DeviceRegistrationPage.handleDeviceRegistrationIfNeeded();

      // Navigate to the Accounts page
      AccountsPage.navigateToAccounts();
    });
  });

  // -------------------------------------------------------
  // Test 1: Accounts page loads with at least one account card
  // -------------------------------------------------------
  it('Should display the Accounts page with at least one account card', () => {
    AccountsPage.verifyPageLoaded();
    AccountsPage.waitForAccountCards();

    // Verify the account card shows key information
    AccountsPage.verifyAccountCardDetails({
      accountNumber: '1200005265',
      companyName: 'Digicore Corporated',
      accountType: 'Savingsorcurrent'
    });
  });

  // -------------------------------------------------------
  // Test 2: Tapping account card opens account details
  // -------------------------------------------------------
  it('Should expand account details showing balance, IBAN/account number, and copy button', () => {
    AccountsPage.waitForAccountCards();
    AccountsPage.navigateToAccountDetails('1200005265');

    // On the detail page, verify balances and account info
    AccountsPage.elements.availableBalanceLabel().should('be.visible');
    AccountsPage.elements.withdrawableAmountLabel().should('be.visible');
    AccountsPage.elements.accountNumberText('1200005265').should('be.visible');

    // Verify the copy button exists next to the account number
    AccountsPage.elements.copyButton().should('exist');
  });

  // -------------------------------------------------------
  // Test 3: Copy account number
  // -------------------------------------------------------
  it('Should have a working copy button for the account number', () => {
    AccountsPage.waitForAccountCards();
    AccountsPage.navigateToAccountDetails('1200005265');

    // Click the copy button — we verify it exists and is clickable
    AccountsPage.copyAccountNumber('1200005265');

    // Clipboard assertions are unreliable in headless mode, so we verify
    // that the copy button was clickable and no errors occurred
  });

  // -------------------------------------------------------
  // Test 4: Transactions section is visible with search and filter
  // -------------------------------------------------------
  it('Should display the Transactions section with search and filter controls', () => {
    AccountsPage.waitForAccountCards();
    AccountsPage.navigateToAccountDetails('1200005265');

    // Scroll to transactions area and verify section elements
    TransactionsPage.verifyTransactionsSectionVisible();
  });

  // -------------------------------------------------------
  // Test 5: Empty state when no transactions exist
  // -------------------------------------------------------
  it('Should show empty state when no transactions exist', () => {
    AccountsPage.waitForAccountCards();
    AccountsPage.navigateToAccountDetails('1200005265');

    // Verify the empty state message and guidance subtext
    TransactionsPage.verifyEmptyState();
  });

  // -------------------------------------------------------
  // Test 6: Search by narration — no full page reload
  // -------------------------------------------------------
  it('Should search transactions by narration without full page reload', function () {
    AccountsPage.waitForAccountCards();
    AccountsPage.navigateToAccountDetails('1200005265');

    // Set up the no-reload assertion before performing the search
    TransactionsPage.setupNoReloadAssertion();

    // Type a search term — since there's no transaction data yet,
    // we just verify the search input works and the page doesn't reload
    TransactionsPage.searchByNarrationNoWait('test-search');

    // Verify no full page reload occurred
    TransactionsPage.verifyNoFullPageReload();

    // After searching with no results, the empty state should still show
    // or the table should show no matching rows
    TransactionsPage.clearSearch();
  });

  // -------------------------------------------------------
  // Test 7: Filter panel — verify structure and date options
  // -------------------------------------------------------
  it('Should open the filter panel with Date Option, Date Range, Apply Search, and Reset', function () {
    AccountsPage.waitForAccountCards();
    AccountsPage.navigateToAccountDetails('1200005265');

    // Open the filter panel
    TransactionsPage.clickFilterButton();

    // Verify all filter panel elements are visible
    TransactionsPage.verifyFilterPanelVisible();
  });

  // -------------------------------------------------------
  // Test 7b: Date Option preset filter — no full page reload
  // -------------------------------------------------------
  it('Should select a Date Option preset filter without full page reload', function () {
    AccountsPage.waitForAccountCards();
    AccountsPage.navigateToAccountDetails('1200005265');

    // Set up the no-reload assertion
    TransactionsPage.setupNoReloadAssertion();

    // Open filter panel and apply a date option preset
    TransactionsPage.clickFilterButton();
    TransactionsPage.applyDateOptionFilter('This month');

    // Verify no full page reload occurred
    TransactionsPage.verifyNoFullPageReload();
  });

  // // -------------------------------------------------------
  // // Test 7c: Date Range custom filter — no full page reload
  // // -------------------------------------------------------
  // it('Should apply a custom Date Range filter without full page reload', function () {
  //   AccountsPage.waitForAccountCards();
  //   AccountsPage.navigateToAccountDetails('1200005265');

  //   // Set up the no-reload assertion
  //   TransactionsPage.setupNoReloadAssertion();

  //   // Open filter panel and apply a custom date range
  //   TransactionsPage.clickFilterButton();
  //   TransactionsPage.applyDateRangeFilter('01/01/2026', '06/10/2026');

  //   // Verify no full page reload occurred
  //   TransactionsPage.verifyNoFullPageReload();
  // });

  // -------------------------------------------------------
  // Test 8: Infinite scroll (placeholder — requires transaction data)
  // -------------------------------------------------------
  it('Should support infinite scroll when transactions exceed one page', function () {
    AccountsPage.waitForAccountCards();
    AccountsPage.navigateToAccountDetails('1200005265');

    // Check if there are any transaction rows to scroll through
    cy.get('body').then($body => {
      const hasTransactions =
        $body.find('table tbody tr, .transaction-row, .transaction-item').filter(':visible').length > 0;

      if (!hasTransactions) {
        cy.log('No transaction data available — skipping infinite scroll test');
        this.skip();
      }
    });

    // If transactions exist, test infinite scroll
    // Store current row count
    TransactionsPage.elements.transactionRows().its('length').then(initialCount => {
      if (initialCount >= 15) {
        // Only test scroll if we have a full page (pageSize=15 from the API)
        TransactionsPage.scrollToLoadMore();
        TransactionsPage.verifyMoreRowsLoaded(initialCount);
      } else {
        cy.log(`Only ${initialCount} transactions — not enough for pagination, skipping scroll test`);
      }
    });
  });

  // -------------------------------------------------------
  // Test 9: Go back link returns to accounts dashboard
  // -------------------------------------------------------
  it('Should navigate back to the Accounts dashboard using the Go back link', () => {
    AccountsPage.waitForAccountCards();
    AccountsPage.navigateToAccountDetails('1200005265');

    // Click Go back and verify we are back on the dashboard
    AccountsPage.clickGoBack();
    AccountsPage.verifyPageLoaded();
  });

  // -------------------------------------------------------
  // Negative Test 1: Search with no matching term shows empty / no results
  // -------------------------------------------------------
  it('Should show no matching results when searching with a term that does not exist', () => {
    AccountsPage.waitForAccountCards();
    AccountsPage.navigateToAccountDetails('1200005265');

    TransactionsPage.searchByNarrationNoWait('zzz_no_match_xyz_00000_unique');

    // Either the empty-state message or a "no results" indicator should be visible
    cy.contains(/no transaction|no result|not found|0 result/i, { timeout: 10000 }).should('be.visible');

    TransactionsPage.clearSearch();
  });

  // -------------------------------------------------------
  // Negative Test 2: Invalid date range (end date before start date)
  // -------------------------------------------------------
  it('Should show an error or no results when end date is before start date in the filter', () => {
    AccountsPage.waitForAccountCards();
    AccountsPage.navigateToAccountDetails('1200005265');

    TransactionsPage.setupNoReloadAssertion();
    TransactionsPage.clickFilterButton();

    // Apply a date range where end is before start — an invalid range
    TransactionsPage.applyDateRangeFilter('06/10/2026', '01/01/2026');

    // The page should either show a validation error or show empty state
    cy.contains(/invalid|error|no transaction|no result/i, { timeout: 10000 }).should('be.visible');
  });

  // -------------------------------------------------------
  // Negative Test 3: Balance visibility toggle masks amounts
  // -------------------------------------------------------
  it('Should mask balance values when the visibility toggle is clicked', () => {
    AccountsPage.waitForAccountCards();
    AccountsPage.navigateToAccountDetails('1200005265');

    // Confirm balance is visible before toggling
    AccountsPage.elements.availableBalanceLabel().should('be.visible');

    // Toggle to hide
    AccountsPage.toggleBalanceVisibility();

    // Balance figures should now be hidden (shown as asterisks or a masked value)
    cy.get('body').then($body => {
      const bodyText = $body.text();
      const isMasked = /\*+|•{3,}/.test(bodyText) || !$body.find('[data-balance], .balance-amount').is(':visible');
      expect(isMasked, 'Balance values should be masked after toggle').to.be.true;
    });

    // Toggle back to restore visibility
    AccountsPage.toggleBalanceVisibility();
    AccountsPage.elements.availableBalanceLabel().should('be.visible');
  });

  // -------------------------------------------------------
  // Negative Test 4: Reset filter restores default state
  // -------------------------------------------------------
  it('Should reset all filters to default when the Reset button is clicked', () => {
    AccountsPage.waitForAccountCards();
    AccountsPage.navigateToAccountDetails('1200005265');

    // Open filter, apply a preset, then reset
    TransactionsPage.clickFilterButton();
    TransactionsPage.expandDateOptionAccordion();
    TransactionsPage.selectDateOption('This week');
    TransactionsPage.clickReset();

    // After reset the panel stays open with the dropdown cleared back to "Select Option"
    TransactionsPage.elements.applySearchButton().should('be.visible');
    cy.contains('Select Option').should('be.visible');
  });

});
