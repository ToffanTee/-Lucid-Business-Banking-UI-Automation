import LoginPage from '../../../pages/login/LoginPage';
import DeviceRegistrationPage from '../../../pages/login/DeviceRegistrationPage';
import CardManagementPage from '../../../pages/card_management/cardManagementPage';
import { generateRandomName } from '../../../utils/dataBuilder';

describe('Lucid Business Banking - Card Management Spec', () => {

  beforeEach(() => {
    LoginPage.visitLoginPage();

    cy.task('readEnvCredentials').then(({ username, password }) => {
      expect(username, 'EXISTING_USER_USERNAME must be set in .env').to.not.be.empty;
      expect(password, 'EXISTING_USER_PASSWORD must be set in .env').to.not.be.empty;

      cy.log(`Logging in with existing user: ${username}`);
      LoginPage.login(username, password);

      DeviceRegistrationPage.handleDeviceRegistrationIfNeeded();

      cy.wait(2000); // Wait for any potential redirects to complete before navigating to Card Management

      CardManagementPage.navigateToCardManagement();
    });
  });

  // -------------------------------------------------------
  // Test 1: Card Management page loads with core sections
  // -------------------------------------------------------
  it('Should display the Card Management page with no active card and request history sections', () => {
    CardManagementPage.verifyPageLoaded();
    CardManagementPage.elements.noActiveCardMessage().should('be.visible');
    CardManagementPage.elements.requestNewCardButton().should('be.visible');
  });

  // -------------------------------------------------------
  // Test 2: Empty state before any card request has been made
  // -------------------------------------------------------
  it('Should show the empty state in Card Request History when no requests exist', () => {
    CardManagementPage.verifyEmptyState();
  });

  // -------------------------------------------------------
  // Test 3: Request new card button opens the Request a Card panel
  // -------------------------------------------------------
  it('Should open the Request a Card panel with all required fields when clicking Request new card', () => {
    CardManagementPage.clickRequestNewCard();

    CardManagementPage.elements.requestForDropdown().should('be.visible');
    CardManagementPage.elements.cardTypeDropdown().should('be.visible');
    CardManagementPage.elements.nameOnCardInput().should('be.visible');
    CardManagementPage.elements.modeOfDeliveryDropdown().should('be.visible');
    CardManagementPage.elements.cardRequestTypeDropdown().should('be.visible');
    CardManagementPage.elements.continueButton().should('be.visible');
  });

  // -------------------------------------------------------
  // Test 4: Complete a card request successfully
  // -------------------------------------------------------
  it('Should complete a card request successfully', () => {
    cy.task('readEnvCredentials').then(({ transactionPin }) => {
      // Card Type, Mode of Delivery, and Card Request Type are dynamic —
      // requestNewCard() selects the first available option for each
      // when no explicit value is passed.
      cy.wait(1000); // Wait for any potential UI transitions before interacting with the form
      CardManagementPage.requestNewCard({
        nameOnCard: generateRandomName(),
        pin: transactionPin
      });
    });
  });

  // -------------------------------------------------------
  // Negative Test 1: Continue is disabled/blocked without selecting required fields
  // -------------------------------------------------------
  it('Should not allow proceeding when required fields are left empty', () => {
    CardManagementPage.clickRequestNewCard();
    // Intentionally skip account and card type selection

    CardManagementPage.elements.continueButton().then($btn => {
      if (Cypress.$($btn).is(':disabled')) {
        cy.wrap($btn).should('be.disabled');
      } else {
        cy.wrap($btn).click({ force: true });
        cy.contains(/required|select|please/i, { timeout: 10000 }).should('be.visible');
      }
    });
  });

});
