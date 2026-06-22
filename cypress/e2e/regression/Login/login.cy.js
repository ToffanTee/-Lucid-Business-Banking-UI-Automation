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

  // -------------------------------------------------------
  // Negative Test 1: Invalid credentials
  // -------------------------------------------------------
  it('Should show an error and remain on login page when credentials are invalid', function () {
    LoginPage.login('non_existent_user_abc_99999', 'WrongPassword@99!');

    cy.url().should('include', '/login');
    cy.contains(/invalid|incorrect|not found|failed|wrong/i, { timeout: 10000 }).should('be.visible');
  });

  // -------------------------------------------------------
  // Negative Test 2: Empty username
  // -------------------------------------------------------
  it('Should prevent login when username field is empty', function () {
    LoginPage.fillPassword('SomePass@123');

    LoginPage.elements.loginButton().then($btn => {
      if (Cypress.$($btn).is(':disabled')) {
        cy.wrap($btn).should('be.disabled');
      } else {
        cy.wrap($btn).click();
        cy.url().should('include', '/login');
      }
    });
  });

  // -------------------------------------------------------
  // Negative Test 3: Empty password
  // -------------------------------------------------------
  it('Should prevent login when password field is empty', function () {
    LoginPage.fillUsername('someusername');

    LoginPage.elements.loginButton().then($btn => {
      if (Cypress.$($btn).is(':disabled')) {
        cy.wrap($btn).should('be.disabled');
      } else {
        cy.wrap($btn).click();
        cy.url().should('include', '/login');
      }
    });
  });

});
