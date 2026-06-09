import { generateRegistrationData } from '../../../utils/dataBuilder';
import RegistrationTypePage from '../../../pages/signup/RegistrationTypePage';
import BusinessCategoryPage from '../../../pages/signup/BusinessCategoryPage';
import BvnPage from '../../../pages/signup/BvnPage';
import BvnVerificationPage from '../../../pages/signup/BvnVerificationPage';
import SignatoryBioPage1 from '../../../pages/signup/SignatoryBioPage1';
import SignatoryBioPage2 from '../../../pages/signup/SignatoryBioPage2';
import KycPage from '../../../pages/signup/KycPage';
import PasscodeVerificationPage from '../../../pages/signup/PasscodeVerificationPage';
import CreateProfilePage from '../../../pages/signup/CreateProfilePage';
import LoginPage from '../../../pages/login/LoginPage';
import DeviceRegistrationPage from '../../../pages/login/DeviceRegistrationPage';
import ImportantNoticePage from '../../../pages/activation/ImportantNoticePage';
import ActivationCompanyInfoPage from '../../../pages/activation/ActivationCompanyInfoPage';
import ActivationSignatoriesPage from '../../../pages/activation/ActivationSignatoriesPage';
import ActivationEditSignatoryPage from '../../../pages/activation/ActivationEditSignatoryPage';
import ActivationSignatoryIdPage from '../../../pages/activation/ActivationSignatoryIdPage';
import ActivationDirectorsPage from '../../../pages/activation/ActivationDirectorsPage';
import ActivationAccountPreferencesPage from '../../../pages/activation/ActivationAccountPreferencesPage';
import ActivationUploadDocumentsPage from '../../../pages/activation/ActivationUploadDocumentsPage';
import ActivationSummaryPage from '../../../pages/activation/ActivationSummaryPage';
import ActivationAgreementPage from '../../../pages/activation/ActivationAgreementPage';

describe('Lucid Business Banking - Account Activation Flow (Signatory/Director - Skipping Directors)', () => {
  let registrationData;

  beforeEach(() => {
    registrationData = generateRegistrationData();
  });

  it('Should complete signup (if needed), login, and verify activation flow, skipping Directors step', () => {
    // Check if new user info is already saved from a previous run and matches what is in .env
    cy.task('readNewUserEnvCredentials').then((envUser) => {
      cy.task('readNewUserCredentials').then((existingNewUser) => {
        const hasEnvCreds = envUser && envUser.username && envUser.password;
        const hasFixtureCreds = existingNewUser && existingNewUser.username && existingNewUser.password;

        if (hasEnvCreds && hasFixtureCreds && existingNewUser.username === envUser.username) {
          cy.log('Found matching existing new user credentials. Skipping signup...');
          registrationData = existingNewUser;
          runLoginAndActivationFlow();
        } else {
          cy.log('No matching existing credentials found (or they were cleared from .env). Running full signup...');
          // Clear the fixture/cache to keep it clean
          cy.task('saveNewUserCredentials', {}).then(() => {
            runFullSignupFlow();
          });
        }
      });
    });

    function runFullSignupFlow() {
      RegistrationTypePage.navigateToSignUp();
      RegistrationTypePage.verifyPageIsDisplayed();
      RegistrationTypePage.selectSignatoryDirector();

      BusinessCategoryPage.completeBusinessCategoryStep();
      BvnPage.completeBvnStep(registrationData.bvn);
      BvnVerificationPage.completeBvnVerification();
      SignatoryBioPage1.completeInfoVerification(registrationData);
      SignatoryBioPage2.completeSignatoryBio2(registrationData);
      KycPage.completeKycStep(registrationData);
      PasscodeVerificationPage.completePasscodeVerification();
      CreateProfilePage.completeProfileCreation(registrationData);
      CreateProfilePage.verifyAccountCreated();

      cy.task('saveNewUserCredentials', registrationData).then(() => {
        runLoginAndActivationFlow();
      });
    }

    function runLoginAndActivationFlow() {
      LoginPage.visitLoginPage();
      LoginPage.login(registrationData.username, registrationData.password);

      DeviceRegistrationPage.handleDeviceRegistrationIfNeeded();
      cy.url().should('not.include', '/auth/device');

      cy.url().then((url) => {
        if (url.includes('/login')) {
          LoginPage.login(registrationData.username, registrationData.password);
        }
      });

      ImportantNoticePage.verifyPageIsDisplayed();
      ImportantNoticePage.clickContinue();

      ActivationCompanyInfoPage.verifyPageIsDisplayed();
      ActivationCompanyInfoPage.verifyPreFilledFields(registrationData);
      ActivationCompanyInfoPage.selectBusinessCategory();
      ActivationCompanyInfoPage.clickContinue();

      ActivationSignatoriesPage.verifyPageIsDisplayed();
      cy.wait(3000);

      const signatoryFirstName = Cypress.env('SIGNATORY_FIRST_NAME') || 'Bunch';

      function uploadDocumentsForSignatory() {
        ActivationSignatoryIdPage.verifyPageIsDisplayed();
        ActivationSignatoryIdPage.selectIdType(0, 'Expiry');
        ActivationSignatoryIdPage.selectMeansOfId(0, 'Business Registration');
        const randomCac = 'RC' + Math.floor(1000000 + Math.random() * 9000000).toString();
        ActivationSignatoryIdPage.fillIdNumber(0, randomCac);
        ActivationSignatoryIdPage.fillIssueDate(0, '01/01/2020');
        ActivationSignatoryIdPage.fillExpiryDate(0, '01/01/2030');
        ActivationSignatoryIdPage.selectIssuingCountry(0, 'Nigeria');
        ActivationSignatoryIdPage.uploadDocument(0);
        ActivationSignatoryIdPage.clickAddMore();
        ActivationSignatoryIdPage.selectIdType(1, 'Non Expiry');
        ActivationSignatoryIdPage.selectMeansOfId(1, 'NIN');
        const signatoryNin = Cypress.env('NIN_FOR_ACTIVATION') || '63184876213';
        ActivationSignatoryIdPage.fillIdNumber(1, signatoryNin);
        ActivationSignatoryIdPage.fillIssueDate(1, '01/01/2020');
        ActivationSignatoryIdPage.selectIssuingCountry(1, 'Nigeria');
        ActivationSignatoryIdPage.uploadDocument(1);
        ActivationSignatoryIdPage.clickContinue();
        ActivationSignatoriesPage.verifyPageIsDisplayed();
        cy.wait(2000);
      }

      cy.get('body').then($body => {
        if ($body.text().includes('No Data Found')) {
          const initiatorEmail = `sig_${Math.floor(Math.random() * 10000)}@yopmail.com`;
          ActivationSignatoriesPage.clickAddSignatory();
          ActivationSignatoriesPage.verifyAddSignatoryFormDisplayed();
          ActivationSignatoriesPage.fillSignatoryForm(initiatorEmail, signatoryFirstName, 'INITIATOR', true);
          ActivationSignatoriesPage.clickNext();
          ActivationSignatoriesPage.clickGoBack();
          ActivationSignatoriesPage.verifyPageIsDisplayed();
          cy.wait(2000);

          const authorizerEmail = `auth_${Math.floor(Math.random() * 10000)}@yopmail.com`;
          ActivationSignatoriesPage.clickAddSignatory();
          ActivationSignatoriesPage.verifyAddSignatoryFormDisplayed();
          ActivationSignatoriesPage.fillSignatoryForm(authorizerEmail, signatoryFirstName, 'AUTHORIZER', false);
          ActivationSignatoriesPage.clickNext();
          ActivationSignatoriesPage.clickGoBack();
          ActivationSignatoriesPage.verifyPageIsDisplayed();
          cy.wait(2000);
        }
      });

      processAllIncompleteSignatories();

      function processAllIncompleteSignatories() {
        cy.wait(2000);
        cy.get('body').then($body => {
          const bodyText = $body.text();

          if (bodyText.includes('Missing Info')) {
            ActivationSignatoriesPage.clickEditOnFirstMissingInfoSignatory();
            ActivationEditSignatoryPage.verifyPageIsDisplayed();
            const editData = {
              ...generateRegistrationData(),
              lastName: Cypress.env('SIGNATORY_LAST_NAME') || 'Dilion'
            };
            ActivationEditSignatoryPage.completeEditForm(editData);
            uploadDocumentsForSignatory();
            processAllIncompleteSignatories();
          } else if (bodyText.includes('Documents Pending')) {
            ActivationSignatoriesPage.clickEditOnFirstPendingSignatory();
            ActivationEditSignatoryPage.verifyPageIsDisplayed();
            const editData = {
              ...generateRegistrationData(),
              lastName: Cypress.env('SIGNATORY_LAST_NAME') || 'Dilion'
            };
            ActivationEditSignatoryPage.completeEditForm(editData);
            uploadDocumentsForSignatory();
            processAllIncompleteSignatories();
          } else if (bodyText.includes('At least one signatory must have the role')) {
            const authEmail = `auth_${Math.floor(Math.random() * 10000)}@yopmail.com`;
            ActivationSignatoriesPage.clickAddSignatory();
            ActivationSignatoriesPage.verifyAddSignatoryFormDisplayed();
            ActivationSignatoriesPage.fillSignatoryForm(authEmail, signatoryFirstName, 'AUTHORIZER', false);
            ActivationSignatoriesPage.clickNext();
            ActivationSignatoriesPage.clickGoBack();
            ActivationSignatoriesPage.verifyPageIsDisplayed();
            cy.wait(2000);
            processAllIncompleteSignatories();
          } else {
            ActivationSignatoriesPage.clickContinue();
            runSkipDirectorsStep();
          }
        });
      }

      function runSkipDirectorsStep() {
        ActivationDirectorsPage.verifyPageIsDisplayed();
        cy.wait(3000);
        cy.log('Skipping optional Directors step by clicking Continue');
        ActivationDirectorsPage.clickContinue();
        ActivationAccountPreferencesPage.completeAccountPreferences();
        ActivationUploadDocumentsPage.completeUploadDocuments();
        ActivationSummaryPage.completeSummaryStep();
        ActivationAgreementPage.completeAgreementStep();
      }
    }
  });
});
