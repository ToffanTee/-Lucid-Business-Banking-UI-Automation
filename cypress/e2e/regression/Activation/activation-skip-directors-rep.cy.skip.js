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
import ActivationCompanyRepPage from '../../../pages/activation/AccountSignatoriesPage';
import ActivationSignatoriesPage from '../../../pages/activation/ActivationSignatoriesPage';
import ActivationEditSignatoryPage from '../../../pages/activation/ActivationEditSignatoryPage';
import ActivationSignatoryIdPage from '../../../pages/activation/ActivationSignatoryIdPage';
import ActivationDirectorsPage from '../../../pages/activation/ActivationDirectorsPage';
import ActivationAccountPreferencesPage from '../../../pages/activation/ActivationAccountPreferencesPage';
import ActivationUploadDocumentsPage from '../../../pages/activation/ActivationUploadDocumentsPage';
import ActivationSummaryPage from '../../../pages/activation/ActivationSummaryPage';
import ActivationAgreementPage from '../../../pages/activation/ActivationAgreementPage';

const ACTIVATION_USERNAME_KEY = 'ACTIVATION_SKIP_REP_USERNAME';
const ACTIVATION_PASSWORD_KEY = 'ACTIVATION_SKIP_REP_PASSWORD';
const ACTIVATION_FIXTURE_FILE = 'activation-skip-rep.json';

describe('Lucid Business Banking - Account Activation Flow (Company Rep - Skipping Directors)', () => {
  let registrationData;

  beforeEach(() => {
    registrationData = generateRegistrationData();
  });

  it('Should complete signup (if needed), login, and verify activation flow, skipping Directors step', () => {
    cy.task('readActivationCredentials', { usernameKey: ACTIVATION_USERNAME_KEY, passwordKey: ACTIVATION_PASSWORD_KEY })
      .then(({ username, password }) => {
        if (username && password) {
          cy.log('Found saved activation credentials — loading registration data from fixture...');
          cy.task('readActivationFixture', { fixtureFile: ACTIVATION_FIXTURE_FILE }).then((savedData) => {
            if (savedData && savedData.username === username) {
              registrationData = savedData;
              runLoginAndActivationFlow();
            } else {
              cy.log('Fixture missing or mismatched — running full signup...');
              runFullSignupFlow();
            }
          });
        } else {
          cy.log('No saved credentials found — running full signup...');
          runFullSignupFlow();
        }
      });

    function runFullSignupFlow() {
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

      cy.task('saveActivationCredentials', {
        usernameKey: ACTIVATION_USERNAME_KEY,
        passwordKey: ACTIVATION_PASSWORD_KEY,
        fixtureFile: ACTIVATION_FIXTURE_FILE,
        data: registrationData
      }).then(() => {
        runLoginAndActivationFlow();
      });
    }

    function runLoginAndActivationFlow() {
      LoginPage.visitLoginPage();
      LoginPage.login(registrationData.username, registrationData.password);

      DeviceRegistrationPage.handleDeviceRegistrationIfNeeded('add', {
        username: registrationData.username,
        password: registrationData.password
      });
      cy.url().should('not.include', '/auth/device');

      ImportantNoticePage.verifyPageIsDisplayed();
      ImportantNoticePage.clickContinue();

      ActivationCompanyInfoPage.verifyPageIsDisplayed();
      ActivationCompanyInfoPage.verifyPreFilledFields(registrationData);
      ActivationCompanyInfoPage.selectBusinessCategory();
      ActivationCompanyInfoPage.clickContinue();

      ActivationCompanyRepPage.verifyPageIsDisplayed();
      ActivationCompanyRepPage.verifyPreFilledFields(registrationData);
      ActivationCompanyRepPage.fillOccupation(registrationData.occupation || 'Software Engineer');
      const activationNin = Cypress.env('NIN_FOR_ACTIVATION') || '63184876213';
      ActivationCompanyRepPage.fillNin(activationNin);
      ActivationCompanyRepPage.clickContinue();

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

        // App may show a confirmation dialog when proceeding with no directors — dismiss it
        cy.wait(1500);
        cy.get('body').then($body => {
          if ($body.find('mat-dialog-container, [role="dialog"]').length > 0) {
            cy.log('Confirmation dialog detected — accepting skip...');
            cy.get('mat-dialog-container, [role="dialog"]')
              .contains('button', /yes|continue|skip|confirm|ok/i)
              .click({ force: true });
          }
        });

        // Wait for navigation away from the Directors page before proceeding
        cy.url().should('not.include', '/directors', { timeout: 15000 });

        ActivationAccountPreferencesPage.completeAccountPreferences();
        ActivationUploadDocumentsPage.completeUploadDocuments();
        ActivationSummaryPage.completeSummaryStep();
        ActivationAgreementPage.completeAgreementStep();
      }
    }
  });
});
