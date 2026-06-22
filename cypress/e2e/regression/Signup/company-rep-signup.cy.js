import { generateRegistrationData } from '../../../utils/dataBuilder';
import RegistrationTypePage from '../../../pages/signup/RegistrationTypePage';
import BusinessCategoryPage from '../../../pages/signup/BusinessCategoryPage';
import CompanyInfoPage from '../../../pages/signup/CompanyInfoPage';
import CompanyRepBioPage1 from '../../../pages/signup/CompanyRepBioPage1';
import CompanyRepBioPage2 from '../../../pages/signup/CompanyRepBioPage2';
import PasscodeVerificationPage from '../../../pages/signup/PasscodeVerificationPage';
import CreateProfilePage from '../../../pages/signup/CreateProfilePage';

describe('Lucid Business Banking - Company Rep Signup', () => {

  let registrationData;

  beforeEach(() => {
    // Generate fresh data for every test iteration to ensure unique payloads
    registrationData = generateRegistrationData()
  });

  it('Should complete the full Company Rep signup flow', () => {

    // Step 1: Navigate to signup page
    RegistrationTypePage.navigateToSignUp()

    // Step 2: Select "As a Company rep" registration type
    RegistrationTypePage.verifyPageIsDisplayed()
    RegistrationTypePage.selectCompanyRep()

    // Step 3: Select business category and continue
    BusinessCategoryPage.completeBusinessCategoryStep()

    // Step 4: Company Information — company details
    CompanyInfoPage.completeCompanyInfoStep(registrationData)

    // Step 5: Company Rep Bio (1/2) — personal details
    CompanyRepBioPage1.completeCompanyRepBio1(registrationData)

    // Step 6: Company Rep Bio (2/2) — address, state, city, state of origin, mother's maiden name
    CompanyRepBioPage2.completeCompanyRepBio2(registrationData)

    // Step 7: Passcode Verification — enter email passcode
    PasscodeVerificationPage.completePasscodeVerification()

    // Step 8: Create Profile
    CreateProfilePage.completeProfileCreation(registrationData)

    // Final assertion
    CreateProfilePage.verifyAccountCreated()

    // Save the newly created user credentials for login tests
    cy.task('saveNewUserCredentials', {
      username: registrationData.username,
      password: registrationData.password,
      email: registrationData.email,
    }).then((savedData) => {
      cy.log(`New user credentials saved — username: ${savedData.username}`)
    })
  });

  // -------------------------------------------------------
  // Negative Test 1: Registration type page requires a selection before proceeding
  // -------------------------------------------------------
  it('Should require a registration type selection before allowing navigation', () => {
    RegistrationTypePage.navigateToSignUp();
    RegistrationTypePage.verifyPageIsDisplayed();

    // Neither option is clicked — the Continue/Next button should be absent or disabled
    cy.contains('button', /continue|next|proceed/i).then($btn => {
      if ($btn.length) {
        cy.wrap($btn).should('be.disabled');
      } else {
        // If there is no continue button until a type is selected, that is correct behaviour
        cy.contains('button', /continue|next|proceed/i).should('not.exist');
      }
    });
  });

  // -------------------------------------------------------
  // Negative Test 2: Weak password is rejected on profile creation
  // -------------------------------------------------------
  it('Should reject a weak password on the Create Profile step', () => {
    RegistrationTypePage.navigateToSignUp();
    RegistrationTypePage.verifyPageIsDisplayed();
    RegistrationTypePage.selectCompanyRep();

    BusinessCategoryPage.completeBusinessCategoryStep();
    CompanyInfoPage.completeCompanyInfoStep(registrationData);
    CompanyRepBioPage1.completeCompanyRepBio1(registrationData);
    CompanyRepBioPage2.completeCompanyRepBio2(registrationData);
    PasscodeVerificationPage.completePasscodeVerification();

    // Override data with a weak password before reaching Create Profile
    const weakData = { ...registrationData, password: 'weak' };

    CreateProfilePage.completeProfileCreation(weakData);

    // The app should show a password strength / validation error
    cy.contains(/too short|strength|must contain|invalid password|requirement/i, { timeout: 10000 }).should('be.visible');
  });

  // -------------------------------------------------------
  // Negative Test 3: Duplicate username is rejected on profile creation
  // -------------------------------------------------------
  it('Should show an error when registering with an already-taken username', () => {
    cy.task('readEnvCredentials').then(({ username: existingUsername }) => {
      expect(existingUsername, 'EXISTING_USER_USERNAME must be set in .env').to.not.be.empty;

      RegistrationTypePage.navigateToSignUp();
      RegistrationTypePage.verifyPageIsDisplayed();
      RegistrationTypePage.selectCompanyRep();

      BusinessCategoryPage.completeBusinessCategoryStep();
      CompanyInfoPage.completeCompanyInfoStep(registrationData);
      CompanyRepBioPage1.completeCompanyRepBio1(registrationData);
      CompanyRepBioPage2.completeCompanyRepBio2(registrationData);
      PasscodeVerificationPage.completePasscodeVerification();

      // Use an already-taken username
      const duplicateData = { ...registrationData, username: existingUsername };

      CreateProfilePage.completeProfileCreation(duplicateData);

      cy.contains(/already exists|taken|unavailable|duplicate|username/i, { timeout: 10000 }).should('be.visible');
    });
  });

});

