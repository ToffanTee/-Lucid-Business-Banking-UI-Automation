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

});
