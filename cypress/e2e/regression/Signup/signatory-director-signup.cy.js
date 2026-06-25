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

    // Save signatory credentials to dedicated env keys for login tests
    cy.task('saveSignatorySignupCredentials', {
      username: registrationData.username,
      password: registrationData.password,
      email: registrationData.email,
    }).then((savedData) => {
      cy.log(`Signatory credentials saved — username: ${savedData.username}`)
    })
  });

  // // -------------------------------------------------------
  // // Negative Test 1: Short BVN (fewer than 11 digits) is rejected
  // // -------------------------------------------------------
  // it('Should show a validation error when a BVN shorter than 11 digits is submitted', () => {
  //   RegistrationTypePage.navigateToSignUp();
  //   RegistrationTypePage.verifyPageIsDisplayed();
  //   RegistrationTypePage.selectSignatoryDirector();

  //   BusinessCategoryPage.completeBusinessCategoryStep();

  //   BvnPage.verifyPageIsDisplayed();
  //   BvnPage.enterBvn('12345'); // only 5 digits — clearly invalid
  //   BvnPage.clickContinue();

  //   cy.contains(/invalid|too short|11 digits|bvn|error/i, { timeout: 10000 }).should('be.visible');
  // });

  // // -------------------------------------------------------
  // // Negative Test 2: Non-numeric BVN is rejected
  // // -------------------------------------------------------
  // it('Should reject a BVN containing non-numeric characters', () => {
  //   RegistrationTypePage.navigateToSignUp();
  //   RegistrationTypePage.verifyPageIsDisplayed();
  //   RegistrationTypePage.selectSignatoryDirector();

  //   BusinessCategoryPage.completeBusinessCategoryStep();

  //   BvnPage.verifyPageIsDisplayed();
  //   BvnPage.enterBvn('ABCDEFGHIJK'); // letters instead of digits
  //   BvnPage.clickContinue();

  //   cy.contains(/invalid|numeric|digits only|bvn|error/i, { timeout: 10000 }).should('be.visible');
  // });

  // // -------------------------------------------------------
  // // Negative Test 3: Empty BVN field — Continue button disabled or error shown
  // // -------------------------------------------------------
  // it('Should prevent proceeding when the BVN field is empty', () => {
  //   RegistrationTypePage.navigateToSignUp();
  //   RegistrationTypePage.verifyPageIsDisplayed();
  //   RegistrationTypePage.selectSignatoryDirector();

  //   BusinessCategoryPage.completeBusinessCategoryStep();

  //   BvnPage.verifyPageIsDisplayed();
  //   // Leave BVN field empty

  //   BvnPage.elements.continueButton().then($btn => {
  //     if (Cypress.$($btn).is(':disabled')) {
  //       cy.wrap($btn).should('be.disabled');
  //     } else {
  //       cy.wrap($btn).click();
  //       cy.contains(/required|enter bvn|bvn|field/i, { timeout: 10000 }).should('be.visible');
  //     }
  //   });
  // });

});

