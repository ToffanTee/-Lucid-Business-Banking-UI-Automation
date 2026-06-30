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

      // Wait for OTP screen to load after PIN submission
      cy.wait(5000);

      // Enter OTP (passcode is 654321 on staging)
      const passcode = Cypress.env('PASSCODE') || '654321';
      IntraBankTransferPage.enterTransactionOtp(passcode);

      // Confirm after OTP
      IntraBankTransferPage.clickConfirmTransfer();

      // Verify success state popup
      IntraBankTransferPage.verifyTransferSuccess();
    });
  });

  // -------------------------------------------------------
  // Test 3: Complete a Later scheduled Intra-bank transfer
  // -------------------------------------------------------
  it('Should complete a Later scheduled Intra-bank transfer', () => {
    cy.task('readEnvCredentials').then(({ transactionPin }) => {
      TransfersPage.clickSendMoney();
      IntraBankTransferPage.switchToIntraBank();

      IntraBankTransferPage.fillDestinationAccount('1100006568');
      IntraBankTransferPage.fillAmount('50');
      IntraBankTransferPage.selectSpendingCategory('TRANSPORT');
      IntraBankTransferPage.fillDescription('Automated later scheduled intra-bank test');
      IntraBankTransferPage.selectScheduleOption('Later');
      IntraBankTransferPage.fillStartDate('07/31/2026');

      IntraBankTransferPage.clickContinue();
      IntraBankTransferPage.clickConfirmTransfer();
      IntraBankTransferPage.enterTransactionPin(transactionPin);
      IntraBankTransferPage.clickConfirmTransfer();

      cy.wait(5000);
      const passcode = Cypress.env('PASSCODE') || '654321';
      IntraBankTransferPage.enterTransactionOtp(passcode);
      IntraBankTransferPage.clickConfirmTransfer();

      IntraBankTransferPage.verifyTransferSuccess();
    });
  });

  // -------------------------------------------------------
  // Test 4: Complete a Repeating scheduled Intra-bank transfer
  // -------------------------------------------------------
  it('Should complete a Repeating scheduled Intra-bank transfer', () => {
    cy.task('readEnvCredentials').then(({ transactionPin }) => {
      TransfersPage.clickSendMoney();
      IntraBankTransferPage.switchToIntraBank();

      IntraBankTransferPage.fillDestinationAccount('1100006568');
      IntraBankTransferPage.fillAmount('50');
      IntraBankTransferPage.selectSpendingCategory('TRANSPORT');
      IntraBankTransferPage.fillDescription('Automated repeating intra-bank test');
      IntraBankTransferPage.selectScheduleOption('Repeating');
      IntraBankTransferPage.fillStartDate('07/01/2026');
      IntraBankTransferPage.fillEndDate('12/31/2026');
      IntraBankTransferPage.selectFrequency('Monthly');

      IntraBankTransferPage.clickContinue();
      IntraBankTransferPage.clickConfirmTransfer();
      IntraBankTransferPage.enterTransactionPin(transactionPin);
      IntraBankTransferPage.clickConfirmTransfer();

      cy.wait(5000);
      const passcode = Cypress.env('PASSCODE') || '654321';
      IntraBankTransferPage.enterTransactionOtp(passcode);
      IntraBankTransferPage.clickConfirmTransfer();

      IntraBankTransferPage.verifyTransferSuccess();
    });
  });

  // // -------------------------------------------------------
  // // Negative Test: Repeating transfer without frequency shows required error
  // // -------------------------------------------------------
  // it('Should show a required field error when Repeating is selected without a frequency', () => {
  //   TransfersPage.clickSendMoney();
  //   IntraBankTransferPage.switchToIntraBank();

  //   IntraBankTransferPage.fillDestinationAccount('1100006568');
  //   IntraBankTransferPage.fillAmount('50');
  //   IntraBankTransferPage.selectScheduleOption('Repeating');
  //   IntraBankTransferPage.fillStartDate('07/01/2026');
  //   IntraBankTransferPage.fillEndDate('12/31/2026');
  //   // Intentionally skip frequency selection

  //   IntraBankTransferPage.elements.continueButton().then($btn => {
  //     if (Cypress.$($btn).is(':disabled')) {
  //       cy.wrap($btn).should('be.disabled');
  //     } else {
  //       cy.wrap($btn).click({ force: true });
  //       IntraBankTransferPage.elements.frequencyRequiredError().should('be.visible');
  //     }
  //   });
  // });

  // -------------------------------------------------------
  // Negative Test 1: Non-existent destination account number
  // -------------------------------------------------------
  it('Should show an account not found error for a non-existent destination account', () => {
    TransfersPage.clickSendMoney();
    IntraBankTransferPage.switchToIntraBank();

    cy.intercept('**/*inquiry*').as('accountEnquiry');
    IntraBankTransferPage.elements.destinationAccountInput().clear().type('0000000000');

    cy.wait('@accountEnquiry', { timeout: 15000 });
    cy.contains(/Name enquiry failed/i, { timeout: 10000 }).should('be.visible');
  });

  // -------------------------------------------------------
  // Negative Test 2: Send Money button disabled when required fields are missing
  // -------------------------------------------------------
  it('Should not allow proceeding when the amount field is empty', () => {
    TransfersPage.clickSendMoney();
    IntraBankTransferPage.switchToIntraBank();

    IntraBankTransferPage.fillDestinationAccount('1100006568');
    // Intentionally leave amount empty

    IntraBankTransferPage.elements.continueButton().then($btn => {
      if (Cypress.$($btn).is(':disabled')) {
        cy.wrap($btn).should('be.disabled');
      } else {
        cy.wrap($btn).click({ force: true });
        cy.contains(/amount|required|field/i, { timeout: 10000 }).should('be.visible');
      }
    });
  });

  // // -------------------------------------------------------
  // // Negative Test 3: Wrong transaction PIN is rejected
  // // -------------------------------------------------------
  // it('Should show an error when an incorrect transaction PIN is entered', () => {
  //   cy.task('readEnvCredentials').then(() => {
  //     TransfersPage.clickSendMoney();
  //     IntraBankTransferPage.switchToIntraBank();

  //     IntraBankTransferPage.fillDestinationAccount('1100006568');
  //     IntraBankTransferPage.fillAmount('100');
  //     IntraBankTransferPage.selectSpendingCategory('TRANSPORT');
  //     IntraBankTransferPage.fillDescription('Negative test - wrong PIN');
  //     IntraBankTransferPage.selectScheduleOption('Now');
  //     IntraBankTransferPage.clickContinue();
  //     IntraBankTransferPage.clickConfirmTransfer();

  //     // Enter a clearly wrong PIN
  //     IntraBankTransferPage.enterTransactionPin('000000');
  //     IntraBankTransferPage.clickConfirmTransfer();

  //     cy.contains(/invalid|Incorrect Pin|wrong|pin|error/i, { timeout: 10000 }).should('be.visible');
  //   });
  // });

  // // -------------------------------------------------------
  // // Negative Test 4: Wrong OTP is rejected
  // // -------------------------------------------------------
  // it('Should show an error when an incorrect transaction OTP is entered', () => {
  //   cy.task('readEnvCredentials').then(({ transactionPin }) => {
  //     TransfersPage.clickSendMoney();
  //     IntraBankTransferPage.switchToIntraBank();

  //     IntraBankTransferPage.fillDestinationAccount('1100006568');
  //     IntraBankTransferPage.fillAmount('100');
  //     IntraBankTransferPage.selectSpendingCategory('TRANSPORT');
  //     IntraBankTransferPage.fillDescription('Negative test - wrong OTP');
  //     IntraBankTransferPage.selectScheduleOption('Now');
  //     IntraBankTransferPage.clickContinue();
  //     IntraBankTransferPage.clickConfirmTransfer();
  //     IntraBankTransferPage.enterTransactionPin(transactionPin);
  //     IntraBankTransferPage.clickConfirmTransfer();

  //     // Enter a clearly wrong OTP
  //     IntraBankTransferPage.enterTransactionOtp('000000');
  //     IntraBankTransferPage.clickConfirmTransfer();

  //     cy.contains(/invalid|incorrect|wrong|otp|code|error/i, { timeout: 10000 }).should('be.visible');
  //   });
  // });

});
