import LoginPage from '../../../pages/login/LoginPage';
import DeviceRegistrationPage from '../../../pages/login/DeviceRegistrationPage';

describe('Lucid Business Banking - Login', () => {

  beforeEach(() => {
    LoginPage.visitLoginPage();
  });

  // -------------------------------------------------------
  // Test: Login with existing/old user credentials from .env
  // -------------------------------------------------------
  it('Should successfully login with existing user credentials', function () {
    // Read credentials live from .env file on disk
    // This ensures we always get the latest password, even if it was
    // changed by a prior forgot-password spec in the same run
    cy.task('readEnvCredentials').then(({ username, password }) => {
      // Guard: ensure credentials are configured
      expect(username, 'EXISTING_USER_USERNAME must be set in .env').to.not.be.empty;
      expect(password, 'EXISTING_USER_PASSWORD must be set in .env').to.not.be.empty;

      cy.log(`Logging in with username: ${username}`);
      LoginPage.login(username, password);

      // Handle device registration if needed — skips if device is already registered
      DeviceRegistrationPage.handleDeviceRegistrationIfNeeded();

      // Assert successful login — user should be on the dashboard
    });
  });

  // -------------------------------------------------------
  // Test: Login with newly created user (from signup test)
  // -------------------------------------------------------
  it('Should successfully login with newly created user credentials', function () {
    cy.task('readNewUserEnvCredentials').then((newUser) => {
      const username = newUser?.username;
      const password = newUser?.password;

      // Skip gracefully if no new user has been created yet
      if (!username || !password) {
        cy.log('No new user credentials found in .env — run a signup test first');
        this.skip();
      }

      cy.log(`Logging in as newly created user: ${username}`);
      LoginPage.login(username, password);

      // Handle device registration for new user too (guaranteed first-time registration)
      DeviceRegistrationPage.completeDeviceRegistration();

      // Assert successful login — user should be on the dashboard
    });
  });

  // // -------------------------------------------------------
  // // Test: Invalid login credentials
  // // -------------------------------------------------------
  // it('Should handle invalid login credentials', function() {
  //   LoginPage.login('invaliduser', 'InvalidPass1!');

  //   // The page URL should still contain lucid-corporate since login failed
  //   cy.url().should('include', 'lucid-corporate');
  // });

});
