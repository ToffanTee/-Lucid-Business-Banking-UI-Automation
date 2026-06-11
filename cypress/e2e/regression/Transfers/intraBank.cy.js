import LoginPage from '../../../pages/login/LoginPage';
import DeviceRegistrationPage from '../../../pages/login/DeviceRegistrationPage';
import TransfersPage from '../../../pages/transfers/TransfersPage';
import IntraBankTransferPage from '../../../pages/transfers/IntraBankTransferPage';

describe('Lucid Business Banking - Intra-bank Transfers Spec', () => {

  beforeEach(() => {
    LoginPage.visitLoginPage();

    // Read credentials directly from the .env file via node task
    cy.task('readEnvCredentials').then(({ username, password, transactionPin }) => {
      // Guard: ensure credentials are set up
      expect(username, 'EXISTING_USER_USERNAME must be set in .env').to.not.be.empty;
      expect(password, 'EXISTING_USER_PASSWORD must be set in .env').to.not.be.empty;
      expect(transactionPin, 'TRANSACTION_PIN must be set in .env').to.not.be.empty;

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

    IntraBankTransferPage.verifySidePanelVisible();
    IntraBankTransferPage.elements.intraBankOption().should('be.visible');
    IntraBankTransferPage.elements.destinationAccountInput().should('be.visible');
  });

  // -------------------------------------------------------
  // Test 2: Complete a single Intra-bank transfer successfully
  // -------------------------------------------------------
  it('Should complete a single Intra-bank transfer successfully', () => {
    cy.task('readEnvCredentials').then(({ transactionPin }) => {
      TransfersPage.clickSendMoney();
      IntraBankTransferPage.switchToIntraBank();

      // Fill transfer details
      // Using account 1100006568 (Laura Akinloye) as provided
      IntraBankTransferPage.fillDestinationAccount('1100006568');
      IntraBankTransferPage.fillAmount('100');
      IntraBankTransferPage.selectSpendingCategory('TRANSPORT');
      IntraBankTransferPage.fillDescription('Automated intra-bank transfer test');
      IntraBankTransferPage.selectScheduleOption('Now');

      // Proceed to confirmation page
      IntraBankTransferPage.clickContinue();

      // Confirm transfer details and launch PIN prompt
      IntraBankTransferPage.clickConfirmTransfer();

      // Enter transaction PIN (123456)
      IntraBankTransferPage.enterTransactionPin(transactionPin);

      // Confirm after PIN (if applicable - clicking the Confirm button)
      IntraBankTransferPage.clickConfirmTransfer();

      // Enter OTP (otpCode is 123456 on staging)
      const otpCode = Cypress.env('OTP_CODE') || '123456';
      IntraBankTransferPage.enterTransactionOtp(otpCode);

      // Confirm after OTP
      IntraBankTransferPage.clickConfirmTransfer();

      // Verify success state popup
      IntraBankTransferPage.verifyTransferSuccess();
    });
  });

});
