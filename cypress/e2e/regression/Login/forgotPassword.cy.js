import ForgotPasswordPage from '../../../pages/login/ForgotPasswordPage';
import { generateRegistrationData } from '../../../utils/dataBuilder';

describe('Lucid Business Banking - Forgot Password', () => {

  // -------------------------------------------------------
  // Test: Complete forgot password flow
  // -------------------------------------------------------
  it('Should successfully reset password via the forgot password flow', function () {
    cy.task('readEnvCredentials').then(({ username }) => {
      // Guard: ensure username is configured
      expect(username, 'EXISTING_USER_USERNAME must be set in .env').to.not.be.empty;

      // Generate a strong new password using the data builder
      const { password: newPassword } = generateRegistrationData();

      cy.log(`Resetting password for user: ${username}`);
      cy.log(`New password will be: ${newPassword}`);

      // Step 1: Enter username → Step 2: Validate passcode → Step 3: Create new password
      ForgotPasswordPage.completeForgotPasswordFlow(username, newPassword);

      // Only save the new password after the flow succeeds
      cy.task('updateEnvPassword', newPassword).then(() => {
        Cypress.env('EXISTING_USER_PASSWORD', newPassword);
        cy.log(`EXISTING_USER_PASSWORD updated to: ${newPassword}`);
      });
    });
  });

  // -------------------------------------------------------
  // Negative Test 1: Non-existent username
  // -------------------------------------------------------
  it('Should show an error when submitting a non-existent username', function () {
    ForgotPasswordPage.navigateToForgotPassword();
    ForgotPasswordPage.fillUsername('totally_fake_user_xyz_00000');
    ForgotPasswordPage.clickContinue();

    cy.contains(/not found|invalid|does not exist|no account|error/i, { timeout: 10000 }).should('be.visible');
  });

  // -------------------------------------------------------
  // Negative Test 2: Mismatched password confirmation
  // -------------------------------------------------------
  // it('Should show a validation error when new passwords do not match', function () {
  //   cy.task('readEnvCredentials').then(({ username }) => {
  //     expect(username, 'EXISTING_USER_USERNAME must be set in .env').to.not.be.empty;

  //     ForgotPasswordPage.navigateToForgotPassword();
  //     ForgotPasswordPage.submitUsername(username);

  //     // Enter the passcode to advance to the create-password step
  //     ForgotPasswordPage.submitPasscode();

  //     // On the create-password step, enter deliberately mismatched passwords
  //     ForgotPasswordPage.verifyCreatePasswordPageIsDisplayed();
  //     ForgotPasswordPage.fillNewPassword('StrongPass@Match1');
  //     ForgotPasswordPage.fillConfirmPassword('DifferentPass@NoMatch2');
  //     ForgotPasswordPage.clickCreatePasswordContinue();

  //     cy.contains(/do not match|mismatch|must match|passwords/i, { timeout: 10000 }).should('be.visible');
  //   });
  // });

  // -------------------------------------------------------
  // Negative Test 3: Weak password rejected
  // -------------------------------------------------------
  it('Should show a validation error when the new password is too weak', function () {
    cy.task('readEnvCredentials').then(({ username }) => {
      expect(username, 'EXISTING_USER_USERNAME must be set in .env').to.not.be.empty;

      ForgotPasswordPage.navigateToForgotPassword();
      ForgotPasswordPage.submitUsername(username);
      ForgotPasswordPage.submitPasscode();

      ForgotPasswordPage.verifyCreatePasswordPageIsDisplayed();
      ForgotPasswordPage.fillNewPassword('weak');
      ForgotPasswordPage.fillConfirmPassword('weak');
      ForgotPasswordPage.clickCreatePasswordContinue();

      // App shows either the inline field error or the toast banner (or both)
      cy.contains(/Input must not be less than 12 characters|Password Should Be At Least Minimum Of 12 Character/i, { timeout: 10000 }).should('be.visible');
    });
  });

});
