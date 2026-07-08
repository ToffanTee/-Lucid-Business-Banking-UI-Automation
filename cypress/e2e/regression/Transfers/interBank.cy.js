import LoginPage from '../../../pages/login/LoginPage';
import DeviceRegistrationPage from '../../../pages/login/DeviceRegistrationPage';
import TransfersPage from '../../../pages/transfers/TransfersPage';
import InterBankTransferPage from '../../../pages/transfers/InterBankTransferPage';
import IntraBankTransferPage from '../../../pages/transfers/IntraBankTransferPage';
import { generateFutureDate } from '../../../utils/dataBuilder';

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
    InterBankTransferPage.elements.destinationBankTrigger().should('be.visible');

    // Switch back to Intra-bank (First Ally Accounts) and verify Destination Bank dropdown is gone
    IntraBankTransferPage.switchToIntraBank();
    InterBankTransferPage.elements.destinationBankTrigger().should('not.exist');
  });

   // -------------------------------------------------------
    // Test 3: Complete a single Inter-bank transfer successfully
    // -------------------------------------------------------
    it('Should complete a single Inter-bank transfer successfully', () => {
      cy.task('readEnvCredentials').then(({ transactionPin }) => {
        TransfersPage.clickSendMoney();
        InterBankTransferPage.switchToInterBank();
  
        // Fill transfer details
        InterBankTransferPage.fillDestinationAccount('3410987243');
        cy.wait(2000); // Wait for any potential API calls triggered by filling the account number
        InterBankTransferPage.selectDestinationBank('Sterling');
        InterBankTransferPage.fillAmount('100');
        InterBankTransferPage.selectSpendingCategory('TRANSPORT');
        InterBankTransferPage.fillDescription('Automated inter-bank transfer test');
        InterBankTransferPage.selectScheduleOption('Now');
  
        // Proceed to confirmation page
        InterBankTransferPage.clickContinue();
  
        // Confirm transfer details and launch PIN prompt
        InterBankTransferPage.clickConfirmTransfer();
  
        // Enter transaction PIN
        InterBankTransferPage.enterTransactionPin(transactionPin);
  
        // Confirm after PIN (if applicable - clicking the Confirm button)
        InterBankTransferPage.clickConfirmTransfer();
  
        // Wait for OTP screen to load after PIN submission
        cy.wait(5000);
  
        // Enter OTP
        const passcode = Cypress.env('PASSCODE') || '654321';
        InterBankTransferPage.enterTransactionOtp(passcode);
  
        // Confirm after OTP
        InterBankTransferPage.clickConfirmTransfer();
  
        // Verify success state popup
        InterBankTransferPage.verifyTransferSuccess();
      });
    });

  // -------------------------------------------------------
  // Test 4: Complete a Later scheduled Inter-bank transfer
  // -------------------------------------------------------
  it('Should complete a Later scheduled Inter-bank transfer', () => {
    cy.task('readEnvCredentials').then(({ transactionPin }) => {
      TransfersPage.clickSendMoney();
      InterBankTransferPage.switchToInterBank();

      InterBankTransferPage.fillDestinationAccount('3410987243');
      cy.wait(2000);
      InterBankTransferPage.selectDestinationBank('Sterling');
      InterBankTransferPage.fillAmount('50');
      InterBankTransferPage.selectSpendingCategory('TRANSPORT');
      InterBankTransferPage.fillDescription('Automated later scheduled inter-bank test');
      InterBankTransferPage.selectScheduleOption('Later');
      InterBankTransferPage.fillStartDate(generateFutureDate(7));

      InterBankTransferPage.clickContinue();
      InterBankTransferPage.clickConfirmTransfer();
      InterBankTransferPage.enterTransactionPin(transactionPin);
      InterBankTransferPage.clickConfirmTransfer();

      cy.wait(5000);
      const passcode = Cypress.env('PASSCODE') || '654321';
      InterBankTransferPage.enterTransactionOtp(passcode);
      InterBankTransferPage.clickConfirmTransfer();

      InterBankTransferPage.verifyTransferSuccess();
    });
  });

  // -------------------------------------------------------
  // Test 5: Complete a Repeating scheduled Inter-bank transfer
  // -------------------------------------------------------
  it('Should complete a Repeating scheduled Inter-bank transfer', () => {
    cy.task('readEnvCredentials').then(({ transactionPin }) => {
      TransfersPage.clickSendMoney();
      InterBankTransferPage.switchToInterBank();

      InterBankTransferPage.fillDestinationAccount('3410987243');
      cy.wait(2000);
      InterBankTransferPage.selectDestinationBank('Sterling');
      InterBankTransferPage.fillAmount('50');
      InterBankTransferPage.selectSpendingCategory('TRANSPORT');
      InterBankTransferPage.fillDescription('Automated repeating inter-bank test');
      InterBankTransferPage.selectScheduleOption('Repeating');
      InterBankTransferPage.fillStartDate(generateFutureDate(1));
      InterBankTransferPage.fillEndDate(generateFutureDate(180));
      InterBankTransferPage.selectFrequency('Monthly');

      InterBankTransferPage.clickContinue();
      InterBankTransferPage.clickConfirmTransfer();
      InterBankTransferPage.enterTransactionPin(transactionPin);
      InterBankTransferPage.clickConfirmTransfer();

      cy.wait(5000);
      const passcode = Cypress.env('PASSCODE') || '654321';
      InterBankTransferPage.enterTransactionOtp(passcode);
      InterBankTransferPage.clickConfirmTransfer();

      InterBankTransferPage.verifyTransferSuccess();
    });
  });

  // // -------------------------------------------------------
  // // Negative Test: Repeating transfer without frequency shows required error
  // // -------------------------------------------------------
  // it('Should show a required field error when Repeating is selected without a frequency', () => {
  //   TransfersPage.clickSendMoney();
  //   InterBankTransferPage.switchToInterBank();

  //   InterBankTransferPage.fillDestinationAccount('3410987243');
  //   cy.wait(2000);
  //   InterBankTransferPage.selectDestinationBank('Sterling');
  //   InterBankTransferPage.fillAmount('50');
  //   InterBankTransferPage.selectScheduleOption('Repeating');
  //   InterBankTransferPage.fillStartDate(generateFutureDate(1));
  //   InterBankTransferPage.fillEndDate(generateFutureDate(180));
  //   // Intentionally skip frequency selection

  //   InterBankTransferPage.elements.continueButton().then($btn => {
  //     if (Cypress.$($btn).is(':disabled')) {
  //       cy.wrap($btn).should('be.disabled');
  //     } else {
  //       cy.wrap($btn).click({ force: true });
  //       InterBankTransferPage.elements.frequencyRequiredError().should('be.visible');
  //     }
  //   });
  // });

  // -------------------------------------------------------
  // Negative Test 1: Cannot proceed without selecting a destination bank
  // -------------------------------------------------------
  it('Should not allow proceeding when no destination bank is selected', () => {
    TransfersPage.clickSendMoney();
    InterBankTransferPage.switchToInterBank();

    // Fill account and amount but leave destination bank unselected
    InterBankTransferPage.elements.destinationAccountInput().clear().type('0123456789');
    InterBankTransferPage.fillAmount('500');

    InterBankTransferPage.elements.continueButton().then($btn => {
      if (Cypress.$($btn).is(':disabled')) {
        cy.wrap($btn).should('be.disabled');
      } else {
        cy.wrap($btn).click({ force: true });
        cy.contains(/bank|required|select|destination/i, { timeout: 10000 }).should('be.visible');
      }
    });
  });

  // -------------------------------------------------------
  // Negative Test 2: Cannot proceed without entering an account number
  // -------------------------------------------------------
  it('Should not allow proceeding when the destination account number is empty', () => {
    TransfersPage.clickSendMoney();
    InterBankTransferPage.switchToInterBank();

    // Leave account number empty, just fill amount
    InterBankTransferPage.fillAmount('500');

    InterBankTransferPage.elements.continueButton().then($btn => {
      if (Cypress.$($btn).is(':disabled')) {
        cy.wrap($btn).should('be.disabled');
      } else {
        cy.wrap($btn).click({ force: true });
        cy.contains(/account|required|destination/i, { timeout: 10000 }).should('be.visible');
      }
    });
  });

  // -------------------------------------------------------
  // Negative Test 3: Destination Bank dropdown is hidden in Intra-bank mode
  // -------------------------------------------------------
  it('Should not show the Destination Bank dropdown when in Intra-bank mode', () => {
    TransfersPage.clickSendMoney();

    // Default state is intra-bank; bank dropdown must not be present
    IntraBankTransferPage.switchToIntraBank();
    cy.contains('Destination Bank').should('not.exist');
  });

});
