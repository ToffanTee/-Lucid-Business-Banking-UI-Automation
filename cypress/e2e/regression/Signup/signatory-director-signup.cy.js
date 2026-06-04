import { generateRegistrationData } from '../../../utils/dataBuilder';
import RegistrationTypePage from '../../../pages/signup/RegistrationTypePage';
import BusinessCategoryPage from '../../../pages/signup/BusinessCategoryPage';
import BvnPage from '../../../pages/signup/BvnPage';
import BvnVerificationPage from '../../../pages/signup/BvnVerificationPage';
import SignatoryBioPage1 from '../../../pages/signup/SignatoryBioPage1';
import SignatoryBioPage2 from '../../../pages/signup/SignatoryBioPage2';
import PasscodeVerificationPage from '../../../pages/signup/PasscodeVerificationPage';
import KycPage from '../../../pages/signup/KycPage';
import CreateProfilePage from '../../../pages/signup/CreateProfilePage';

describe('Lucid Business Banking - Signatory/Director Signup', () => {

  let registrationData;

  beforeEach(() => {
    // Generate fresh data for every test iteration to ensure unique payloads
    registrationData = generateRegistrationData()
  });

  it('Should complete the full Signatory/Director signup flow', () => {

    // Step 1: Navigate to signup page
    RegistrationTypePage.navigateToSignUp()

    // Step 2: Select "As a signatory/director" registration type
    RegistrationTypePage.verifyPageIsDisplayed()
    RegistrationTypePage.selectSignatoryDirector()

    // Step 3: Select business category and continue
    BusinessCategoryPage.completeBusinessCategoryStep()

    // Step 4: Enter BVN and continue
    BvnPage.completeBvnStep(registrationData.bvn)

    // Step 5: BVN Verification — enter OTP
    BvnVerificationPage.completeBvnVerification()

    // Step 6a: Signatory Bio (1/2)
    SignatoryBioPage1.completeInfoVerification(registrationData)

    // Step 6b: Signatory Bio (2/2) — Address, State, City, State of Origin, Mother's Maiden Name
    SignatoryBioPage2.completeSignatoryBio2(registrationData)

    // Step 7: KYC
    KycPage.completeKycStep(registrationData)

    // Step 8: Passcode Verification — enter email passcode
    PasscodeVerificationPage.completePasscodeVerification()

    // Step 9: Create Profile
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

