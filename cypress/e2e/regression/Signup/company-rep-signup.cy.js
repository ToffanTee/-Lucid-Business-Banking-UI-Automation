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

});

