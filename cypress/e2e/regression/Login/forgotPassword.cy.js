import ForgotPasswordPage from '../../../pages/login/ForgotPasswordPage';
import { generateRegistrationData } from '../../../utils/dataBuilder';

describe('Lucid Business Banking - Forgot Password', () => {

  // -------------------------------------------------------
  // Test: Complete forgot password flow
  // -------------------------------------------------------
  it('Should successfully reset password via the forgot password flow', function () {
    const username = Cypress.env('EXISTING_USER_USERNAME');

    // Guard: ensure username is configured
    expect(username, 'EXISTING_USER_USERNAME must be set in .env').to.not.be.empty;

    // Generate a strong new password using the data builder
    const { password: newPassword } = generateRegistrationData();

    cy.log(`Resetting password for user: ${username}`);
    cy.log(`New password will be: ${newPassword}`);

    // Run the complete forgot password flow
    // Step 1: Enter username → Step 2: Validate passcode → Step 3: Create new password
    ForgotPasswordPage.completeForgotPasswordFlow(username, newPassword);

    // The .env file is automatically updated with the new password
    // via the cy.task('updateEnvPassword') call inside submitNewPassword()
  });

});
