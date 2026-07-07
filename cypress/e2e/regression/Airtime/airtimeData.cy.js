import LoginPage from '../../../pages/login/LoginPage';
import DeviceRegistrationPage from '../../../pages/login/DeviceRegistrationPage';
import AirtimeDataPage from '../../../pages/airtime/AirtimeDataPage';

describe('Lucid Business Banking - Airtime & Data Spec', () => {

  beforeEach(() => {
    LoginPage.visitLoginPage();

    cy.task('readEnvCredentials').then(({ username, password }) => {
      expect(username, 'EXISTING_USER_USERNAME must be set in .env').to.not.be.empty;
      expect(password, 'EXISTING_USER_PASSWORD must be set in .env').to.not.be.empty;

      cy.log(`Logging in with existing user: ${username}`);
      LoginPage.login(username, password);

      DeviceRegistrationPage.handleDeviceRegistrationIfNeeded();

      AirtimeDataPage.navigateToAirtimeData();
    });
  });

  // // -------------------------------------------------------
  // // Test 1: Airtime & Data page loads with providers and history
  // // -------------------------------------------------------
  // it('Should display the Airtime & Data page with provider grid and history section', () => {
  //   AirtimeDataPage.verifyPageLoaded();

  //   // Verify known airtime providers are present
  //   AirtimeDataPage.elements.providerTile('MTN').should('be.visible');
  //   AirtimeDataPage.elements.providerTile('Glo').should('be.visible');
  //   AirtimeDataPage.elements.providerTile('Airtel').should('be.visible');
  //   AirtimeDataPage.elements.providerTile('9Mobile').should('be.visible');

  //   // Verify history section is visible
  //   AirtimeDataPage.elements.historySection().should('be.visible');
  //   AirtimeDataPage.elements.historySearchInput().should('be.visible');
  //   AirtimeDataPage.elements.historyFilterButton().should('be.visible');
  // });

  // // -------------------------------------------------------
  // // Test 2: Selecting a provider opens the purchase panel
  // // -------------------------------------------------------
  // it('Should open the Airtime Purchase panel when a provider is selected', () => {
  //   AirtimeDataPage.selectProvider('MTN');

  //   AirtimeDataPage.elements.purchasePanelHeader().should('be.visible');
  //   AirtimeDataPage.elements.packageDropdown().should('be.visible');
  //   AirtimeDataPage.elements.phoneNumberInput().should('be.visible');
  //   AirtimeDataPage.elements.amountInput().should('be.visible');
  //   AirtimeDataPage.elements.continueButton().should('be.visible');
  // });

  // // -------------------------------------------------------
  // // Test 3: Provider search filters the provider grid
  // // -------------------------------------------------------
  // it('Should filter providers when searching by provider name', () => {
  //   AirtimeDataPage.searchProvider('MTN');

  //   AirtimeDataPage.elements.providerTile('MTN').should('be.visible');
  // });

  // // -------------------------------------------------------
  // // Test 4: Complete an airtime purchase successfully (MTN)
  // // -------------------------------------------------------
  // it('Should complete an MTN airtime purchase successfully', () => {
  //   cy.task('readEnvCredentials').then(({ transactionPin }) => {
  //     cy.wait(1000)
  //     AirtimeDataPage.selectProvider('MTN');
  //     AirtimeDataPage.selectPayFromAccount();

  //     cy.wait(3000)
  //     AirtimeDataPage.selectFirstPackage();
  //     AirtimeDataPage.fillPhoneNumber('8012345678');

  //     AirtimeDataPage.clickContinue();
  //     AirtimeDataPage.clickConfirm();
  //     AirtimeDataPage.enterTransactionPin(transactionPin);
  //     AirtimeDataPage.clickConfirm();

  //     cy.wait(3000);
  //     const passcode = Cypress.env('PASSCODE') || '654321';
  //     AirtimeDataPage.enterTransactionOtp(passcode);
  //     AirtimeDataPage.clickConfirm();

  //     AirtimeDataPage.verifyPurchaseSuccess();
  //   });
  // });

  // // -------------------------------------------------------
  // // Test 5: Complete an Airtel airtime purchase successfully
  // // -------------------------------------------------------
  // it('Should complete an Airtel airtime purchase successfully', () => {
  //   cy.task('readEnvCredentials').then(({ transactionPin }) => {
  //     cy.wait(1000)
  //     AirtimeDataPage.selectProvider('Airtel');
  //     AirtimeDataPage.selectPayFromAccount();

  //     cy.wait(3000)
  //     AirtimeDataPage.selectFirstPackage();
  //     AirtimeDataPage.fillPhoneNumber('8012345678');

  //     AirtimeDataPage.clickContinue();
  //     AirtimeDataPage.clickConfirm();
  //     AirtimeDataPage.enterTransactionPin(transactionPin);
  //     AirtimeDataPage.clickConfirm();

  //     cy.wait(3000);
  //     const passcode = Cypress.env('PASSCODE') || '654321';
  //     AirtimeDataPage.enterTransactionOtp(passcode);
  //     AirtimeDataPage.clickConfirm();

  //     AirtimeDataPage.verifyPurchaseSuccess();
  //   });
  // });

  // -------------------------------------------------------
  // Test 6: History search filters results by phone number
  // -------------------------------------------------------
  it('Should filter history records when searching by phone number', () => {
    const testPhone = '08123882646';
    AirtimeDataPage.searchHistory(testPhone);

    // All visible rows should contain the searched phone number
    cy.get('table tbody tr, [class*="history"] [class*="row"]').each($row => {
      cy.wrap($row).should('contain.text', testPhone.replace(/^0/, ''));
    });
  });

  // // -------------------------------------------------------
  // // Negative Test 1: Continue is disabled without selecting a package
  // // -------------------------------------------------------
  // it('Should not allow proceeding when no package is selected', () => {
  //   AirtimeDataPage.selectProvider('MTN');
  //   AirtimeDataPage.selectPayFromAccount();

  //   AirtimeDataPage.fillPhoneNumber('8012345678');
  //   // Intentionally skip package selection

  //   AirtimeDataPage.elements.continueButton().then($btn => {
  //     if (Cypress.$($btn).is(':disabled')) {
  //       cy.wrap($btn).should('be.disabled');
  //     } else {
  //       cy.wrap($btn).click({ force: true });
  //       cy.contains(/package|required|select/i, { timeout: 10000 }).should('be.visible');
  //     }
  //   });
  // });

  // // -------------------------------------------------------
  // // Negative Test 2: Continue is disabled without a phone number
  // // -------------------------------------------------------
  // it('Should not allow proceeding when phone number is empty', () => {
  //   AirtimeDataPage.selectProvider('MTN');
  //   AirtimeDataPage.selectPayFromAccount();

  //   AirtimeDataPage.selectFirstPackage();
  //   // Intentionally leave phone number empty

  //   AirtimeDataPage.elements.continueButton().then($btn => {
  //     if (Cypress.$($btn).is(':disabled')) {
  //       cy.wrap($btn).should('be.disabled');
  //     } else {
  //       cy.wrap($btn).click({ force: true });
  //       cy.contains(/phone|number|required/i, { timeout: 10000 }).should('be.visible');
  //     }
  //   });
  // });

});
