import LoginPage from '../../../pages/login/LoginPage';
import DeviceRegistrationPage from '../../../pages/login/DeviceRegistrationPage';
import DashboardPage from '../../../pages/dashboard/DashboardPage';

describe('Lucid Business Banking - Dashboard Verification', () => {

  beforeEach(() => {
    LoginPage.visitLoginPage();
  });

  it('Should successfully login with existing user credentials and view the dashboard', () => {
    // Read credentials directly from the .env file on disk
    cy.task('readEnvCredentials').then(({ username, password }) => {
      // Guard: ensure credentials are set up
      expect(username, 'EXISTING_USER_USERNAME must be set in .env').to.not.be.empty;
      expect(password, 'EXISTING_USER_PASSWORD must be set in .env').to.not.be.empty;

      cy.log(`Logging in with existing user: ${username}`);
      LoginPage.login(username, password);

      // Handle device registration if required for first time login or session
      DeviceRegistrationPage.handleDeviceRegistrationIfNeeded();

      // Verify Dashboard is successfully loaded and matches visual expectation
      DashboardPage.verifyDashboardLoaded();
    });
  });

  // -------------------------------------------------------
  // Negative Test 1: Unauthenticated access is redirected
  // -------------------------------------------------------
  it('Should redirect to login when accessing dashboard URL without authentication', () => {
    // Attempt to navigate directly to the protected dashboard route
    cy.visit('/app/dashboard', { failOnStatusCode: false });
    cy.url().should('include', '/login');
  });

  // -------------------------------------------------------
  // Negative Test 2: Unauthenticated access to accounts is redirected
  // -------------------------------------------------------
  it('Should redirect to login when accessing a protected accounts URL without authentication', () => {
    cy.visit('/app/accounts/dashboard', { failOnStatusCode: false });
    cy.url().should('include', '/login');
  });

  // -------------------------------------------------------
  // Negative Test 3: Unauthenticated access to transfers is redirected
  // -------------------------------------------------------
  it('Should redirect to login when accessing a protected transfers URL without authentication', () => {
    cy.visit('/app/transfers/home', { failOnStatusCode: false });
    cy.url().should('include', '/login');
  });

});
