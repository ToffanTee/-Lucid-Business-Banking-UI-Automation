import LoginPage from '../../../pages/login/LoginPage';
import DeviceRegistrationPage from '../../../pages/login/DeviceRegistrationPage';
import TransfersPage from '../../../pages/transfers/TransfersPage';
import InterBankTransferPage from '../../../pages/transfers/InterBankTransferPage';
import IntraBankTransferPage from '../../../pages/transfers/IntraBankTransferPage';

describe('Lucid Business Banking - Inter-bank Transfers Spec', () => {

  beforeEach(() => {
    LoginPage.visitLoginPage();

    // Read credentials directly from the .env file via node task
    cy.task('readEnvCredentials').then(({ username, password }) => {
      // Guard: ensure credentials are set up
      expect(username, 'EXISTING_USER_USERNAME must be set in .env').to.not.be.empty;
      expect(password, 'EXISTING_USER_PASSWORD must be set in .env').to.not.be.empty;

      cy.log(`Logging in with existing user: ${username}`);
      LoginPage.login(username, password);

      // Handle device registration if required
      DeviceRegistrationPage.handleDeviceRegistrationIfNeeded();

      // Navigate to the Transfers page
      TransfersPage.navigateToTransfers();
    });
  });

  // -------------------------------------------------------
  // Test 1: Transfers landing page loads & Send Money opens panel
  // -------------------------------------------------------
  it('Should display the Transfers page and open the Send Money side panel', () => {
    TransfersPage.verifyPageLoaded();
    TransfersPage.clickSendMoney();

    InterBankTransferPage.elements.interBankOption().should('be.visible');
  });

  // -------------------------------------------------------
  // Test 2: Switch between First Ally Accounts & Other Banks dynamically
  // -------------------------------------------------------
  it('Should switch between First Ally Accounts and Other Banks dynamically', () => {
    TransfersPage.clickSendMoney();

    // Switch to Inter-bank (Other Banks) and verify Destination Bank dropdown appears
    InterBankTransferPage.switchToInterBank();
    InterBankTransferPage.elements.destinationBankDropdown().should('be.visible');

    // Switch back to Intra-bank (First Ally Accounts) and verify Destination Bank dropdown is gone
    IntraBankTransferPage.switchToIntraBank();
    InterBankTransferPage.elements.destinationBankDropdown().should('not.exist');
  });

});
