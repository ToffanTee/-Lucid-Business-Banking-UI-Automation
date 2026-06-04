import { generateRegistrationData } from '../../../utils/dataBuilder';
import RegistrationTypePage from '../../../pages/signup/RegistrationTypePage';
import BusinessCategoryPage from '../../../pages/signup/BusinessCategoryPage';
import CompanyInfoPage from '../../../pages/signup/CompanyInfoPage';
import CompanyRepBioPage1 from '../../../pages/signup/CompanyRepBioPage1';
import CompanyRepBioPage2 from '../../../pages/signup/CompanyRepBioPage2';
import PasscodeVerificationPage from '../../../pages/signup/PasscodeVerificationPage';
import CreateProfilePage from '../../../pages/signup/CreateProfilePage';
import LoginPage from '../../../pages/login/LoginPage';
import DeviceRegistrationPage from '../../../pages/login/DeviceRegistrationPage';
import ImportantNoticePage from '../../../pages/activation/ImportantNoticePage';
import ActivationCompanyInfoPage from '../../../pages/activation/ActivationCompanyInfoPage';
import ActivationCompanyRepPage from '../../../pages/activation/ActivationCompanyRepPage';
import ActivationSignatoriesPage from '../../../pages/activation/ActivationSignatoriesPage';
import ActivationEditSignatoryPage from '../../../pages/activation/ActivationEditSignatoryPage';
import ActivationSignatoryIdPage from '../../../pages/activation/ActivationSignatoryIdPage';

describe('Lucid Business Banking - Account Activation Flow (Part 1, 2 & 3)', () => {

  let registrationData;

  beforeEach(() => {
    // Generate fresh data for every test iteration
    registrationData = generateRegistrationData();
  });

  it('Should complete signup (if needed), login, and verify first steps of account activation', () => {
    
    // Check if new user info is already saved from a previous run
    cy.task('readNewUserCredentials').then((existingNewUser) => {
      if (existingNewUser && existingNewUser.username && existingNewUser.password) {
        cy.log('Found existing new user credentials in newUser.json. Skipping signup...');
        registrationData = existingNewUser;
        runLoginAndActivationFlow();
      } else {
        cy.log('No existing new user credentials found. Running full signup...');
        runFullSignupFlow();
      }
    });

    function runFullSignupFlow() {
      // Phase 1: Complete User Signup
      RegistrationTypePage.navigateToSignUp();
      RegistrationTypePage.verifyPageIsDisplayed();
      RegistrationTypePage.selectCompanyRep();

      BusinessCategoryPage.completeBusinessCategoryStep();
      CompanyInfoPage.completeCompanyInfoStep(registrationData);
      CompanyRepBioPage1.completeCompanyRepBio1(registrationData);
      CompanyRepBioPage2.completeCompanyRepBio2(registrationData);
      PasscodeVerificationPage.completePasscodeVerification();
      CreateProfilePage.completeProfileCreation(registrationData);
      CreateProfilePage.verifyAccountCreated();

      // Save the credentials (also writes to .env)
      cy.task('saveNewUserCredentials', registrationData).then(() => {
        runLoginAndActivationFlow();
      });
    }

    function runLoginAndActivationFlow() {
      // ==========================================
      // Phase 2: Log in as the newly created user
      // ==========================================
      LoginPage.visitLoginPage();
      LoginPage.login(registrationData.username, registrationData.password);

      // ==========================================
      // Phase 3: Register Device (First login requirement)
      // ==========================================
      // Use handleDeviceRegistrationIfNeeded so that if it is already registered (on a rerun), it skips gracefully
      DeviceRegistrationPage.handleDeviceRegistrationIfNeeded();

      // Wait for the URL to change away from the device registration page if it was loaded
      cy.url().should('not.include', '/auth/device');

      // If we got redirected back to login page (post device registration), log in again
      cy.url().then((url) => {
        if (url.includes('/login')) {
          cy.log('Redirected to login after device registration. Logging in again...');
          LoginPage.login(registrationData.username, registrationData.password);
        }
      });

      // ==========================================
      // Phase 4: Account Activation Flow
      // ==========================================
      
      // Step 4.1: Important Notice Page
      ImportantNoticePage.verifyPageIsDisplayed();
      ImportantNoticePage.clickContinue();

      // Step 4.2: Company Information Step
      ActivationCompanyInfoPage.verifyPageIsDisplayed();
      ActivationCompanyInfoPage.verifyPreFilledFields(registrationData);
      ActivationCompanyInfoPage.selectBusinessCategory();
      ActivationCompanyInfoPage.clickContinue();

      // Step 4.3: Company Representative Step
      ActivationCompanyRepPage.verifyPageIsDisplayed();
      ActivationCompanyRepPage.verifyPreFilledFields(registrationData);
      ActivationCompanyRepPage.fillOccupation(registrationData.occupation || 'Software Engineer');
      // Use NIN from .env
      const activationNin = Cypress.env('NIN_FOR_ACTIVATION') || '63184876213';
      ActivationCompanyRepPage.fillNin(activationNin);
      ActivationCompanyRepPage.clickContinue();

      // Step 4.4: Signatories Step
      ActivationSignatoriesPage.verifyPageIsDisplayed();
      ActivationSignatoriesPage.verifyNoDataFound();
      ActivationSignatoriesPage.clickAddNewSignatory();

      // Fill Add Signatory Form
      ActivationSignatoriesPage.verifyAddSignatoryFormDisplayed();
      const signatoryEmail = `sig_${Math.floor(Math.random() * 10000)}@yopmail.com`;
      const signatoryFirstName = `SigFirstName_${Math.floor(Math.random() * 1000)}`;
      ActivationSignatoriesPage.fillSignatoryForm(signatoryEmail, signatoryFirstName, 'INITIATOR', true);
      ActivationSignatoriesPage.clickNext();

      // After filling the signatory form, the user is still kept on the form.
      // Go back to the signatories landing page.
      ActivationSignatoriesPage.clickGoBack();
      ActivationSignatoriesPage.verifyPageIsDisplayed();

      // Edit the added signatory to fill in the missing info
      ActivationSignatoriesPage.clickEditSignatory(signatoryFirstName);

      // Verify and fill the Edit Signatory form
      ActivationEditSignatoryPage.verifyPageIsDisplayed();
      ActivationEditSignatoryPage.verifyPreFilledFields(signatoryEmail, signatoryFirstName, 'INITIATOR');
      ActivationEditSignatoryPage.completeEditForm(registrationData);

      // ==========================================
      // Step 4.5: Signatory Identification Document Upload
      // ==========================================
      ActivationSignatoryIdPage.verifyPageIsDisplayed();

      // 1. Fill first document (Business Registration Certification - Expiry)
      ActivationSignatoryIdPage.selectIdType(0, 'Expiry');
      ActivationSignatoryIdPage.selectMeansOfId(0, 'Business Registration'); // matches Business Registration Certification
      const randomCac = 'RC' + Math.floor(1000000 + Math.random() * 9000000).toString();
      ActivationSignatoryIdPage.fillIdNumber(0, randomCac);
      ActivationSignatoryIdPage.fillIssueDate(0, '01/01/2020');
      ActivationSignatoryIdPage.fillExpiryDate(0, '01/01/2030');
      ActivationSignatoryIdPage.selectIssuingCountry(0, 'Nigeria');
      ActivationSignatoryIdPage.uploadDocument(0);

      // Add another document
      ActivationSignatoryIdPage.clickAddMore();

      // 2. Fill second document (NIN - Non Expiry)
      ActivationSignatoryIdPage.selectIdType(1, 'Non Expiry');
      ActivationSignatoryIdPage.selectMeansOfId(1, 'NIN');
      const signatoryNin = Cypress.env('NIN_FOR_ACTIVATION') || '63184876213';
      ActivationSignatoryIdPage.fillIdNumber(1, signatoryNin);
      ActivationSignatoryIdPage.fillIssueDate(1, '01/01/2020');
      ActivationSignatoryIdPage.selectIssuingCountry(1, 'Nigeria');
      ActivationSignatoryIdPage.uploadDocument(1);

      // Submit the documents
      ActivationSignatoryIdPage.clickContinue();

      // Return to landing page & continue
      ActivationSignatoriesPage.verifyPageIsDisplayed();
      ActivationSignatoriesPage.clickContinue();
    }
  });

});
