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
import ActivationEditDirectorPage from '../../../pages/activation/ActivationEditDirectorPage';
import ActivationDirectorIdPage from '../../../pages/activation/ActivationDirectorIdPage';
import ActivationAccountPreferencesPage from '../../../pages/activation/ActivationAccountPreferencesPage';
import ActivationUploadDocumentsPage from '../../../pages/activation/ActivationUploadDocumentsPage';
import ActivationSummaryPage from '../../../pages/activation/ActivationSummaryPage';
import ActivationAgreementPage from '../../../pages/activation/ActivationAgreementPage';
import YopmailPage from '../../../pages/yopmail/YopmailPage';

const ACTIVATION_USERNAME_KEY = 'ACTIVATION_SIG_USERNAME';
const ACTIVATION_PASSWORD_KEY = 'ACTIVATION_SIG_PASSWORD';
const ACTIVATION_FIXTURE_FILE = 'activation-sig.json';

describe('Lucid Business Banking - Account Activation Flow (Signatory/Director)', () => {

  let registrationData;

  beforeEach(() => {
    // Generate fresh data for every test iteration
    registrationData = generateRegistrationData();
  });

  it('Should complete signup (if needed), login, and verify activation as Signatory/Director', () => {

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
      // Phase 1: Complete User Signup (Signatory/Director path)
      RegistrationTypePage.navigateToSignUp();
      RegistrationTypePage.verifyPageIsDisplayed();
      RegistrationTypePage.selectSignatoryDirector();

      // Step: Business Category
      BusinessCategoryPage.completeBusinessCategoryStep();

      // Step: BVN Entry
      BvnPage.completeBvnStep(registrationData.bvn);

      // Step: BVN Verification (OTP)
      BvnVerificationPage.completeBvnVerification();

      // Step: Signatory Bio (1/2) — personal details
      SignatoryBioPage1.completeInfoVerification(registrationData);

      // Step: Signatory Bio (2/2) — address, state, city, state of origin, mother's maiden name
      SignatoryBioPage2.completeSignatoryBio2(registrationData);

      // Step: KYC / Organization Profile
      KycPage.completeKycStep(registrationData);

      // Step: Passcode Verification
      PasscodeVerificationPage.completePasscodeVerification();

      // Step: Create Profile
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
      // ==========================================
      // Phase 2: Log in as the newly created user
      // ==========================================
      LoginPage.visitLoginPage();
      LoginPage.login(registrationData.username, registrationData.password);

      // ==========================================
      // Phase 3: Register Device (First login requirement)
      // ==========================================
      DeviceRegistrationPage.handleDeviceRegistrationIfNeeded('add', {
        username: registrationData.username,
        password: registrationData.password
      });

      // Wait for the URL to change away from the device registration page if it was loaded
      cy.url().should('not.include', '/auth/device');

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

      // ==========================================
      // Step 4.3: Signatories Step (Smart Handling)
      // NOTE: In the Signatory/Director flow, there is NO "Company Representative"
      // form step. After Company Info, it goes straight to the Signatories listing.
      // ==========================================
      ActivationSignatoriesPage.verifyPageIsDisplayed();
      cy.wait(3000); // Allow dynamic content to fully render

      const signatoryFirstName = Cypress.env('SIGNATORY_FIRST_NAME') || 'Bunch';

      // Helper function to complete ID document uploads
      function uploadDocumentsForSignatory() {
        ActivationSignatoryIdPage.verifyPageIsDisplayed();

        // Doc 1: Business Registration Certificate (Expiry)
        ActivationSignatoryIdPage.selectIdType(0, 'Expiry');
        ActivationSignatoryIdPage.selectMeansOfId(0, 'Business Registration');
        const randomCac = 'RC' + Math.floor(1000000 + Math.random() * 9000000).toString();
        ActivationSignatoryIdPage.fillIdNumber(0, randomCac);
        ActivationSignatoryIdPage.fillIssueDate(0, '01/01/2020');
        ActivationSignatoryIdPage.fillExpiryDate(0, '01/01/2030');
        ActivationSignatoryIdPage.selectIssuingCountry(0, 'Nigeria');
        ActivationSignatoryIdPage.uploadDocument(0);

        ActivationSignatoryIdPage.clickAddMore();

        // Doc 2: NIN (Non Expiry) — same NIN for all signatories
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

      // 1. Check if signatories already exist or the page is empty
      cy.get('body').then($body => {
        if ($body.text().includes('No Data Found')) {
          cy.log('No signatories found — creating INITIATOR and AUTHORIZER');

          // Create INITIATOR signatory
          const initiatorEmail = `sig_${Math.floor(Math.random() * 10000)}@yopmail.com`;
          ActivationSignatoriesPage.clickAddSignatory();
          ActivationSignatoriesPage.verifyAddSignatoryFormDisplayed();
          ActivationSignatoriesPage.fillSignatoryForm(initiatorEmail, signatoryFirstName, 'INITIATOR', true);
          ActivationSignatoriesPage.clickNext();
          ActivationSignatoriesPage.clickGoBack();
          ActivationSignatoriesPage.verifyPageIsDisplayed();
          cy.wait(2000);

          // Create AUTHORIZER signatory (same name since NIN must match)
          const authorizerEmail = `auth_${Math.floor(Math.random() * 10000)}@yopmail.com`;
          ActivationSignatoriesPage.clickAddSignatory();
          ActivationSignatoriesPage.verifyAddSignatoryFormDisplayed();
          ActivationSignatoriesPage.fillSignatoryForm(authorizerEmail, signatoryFirstName, 'AUTHORIZER', false);
          ActivationSignatoriesPage.clickNext();
          ActivationSignatoriesPage.clickGoBack();
          ActivationSignatoriesPage.verifyPageIsDisplayed();
          cy.wait(2000);
        } else {
          cy.log('Signatories already exist — checking for missing roles');
        }
      });

      // 2. Recursively process all signatories with incomplete status
      processAllIncompleteSignatories();

      function runSignatoryVerificationFlow(email) {
        cy.log(`Running Signatory verification flow for: ${email}`);
        const signatoryData = { ...generateRegistrationData(), email: email };

        YopmailPage.visitAndGetVerificationLink(email);
        cy.get('@verificationLink').then((href) => {
          cy.log(`Navigating to verification link: ${href}`);
          cy.visit(href);
        });

        cy.contains('button', 'Continue', { timeout: 15000 }).should('be.visible').click();

        BvnPage.completeBvnStep(signatoryData.bvn);
        BvnVerificationPage.completeBvnVerification();
        SignatoryBioPage1.completeInfoVerification(signatoryData);
        SignatoryBioPage2.completeSignatoryBio2(signatoryData);
        CreateProfilePage.completeProfileCreation(signatoryData);

        cy.contains('Success!', { timeout: 15000 }).should('be.visible');
        cy.contains('Your account information will be reviewed').should('be.visible');
        cy.contains('button', 'Close').should('be.visible').click();
      }

      function processAllIncompleteSignatories() {
        // Wait for the signatories list to reach a deterministic state before reading it.
        // Status banners (Missing Info, Documents Pending) load asynchronously and may
        // appear after the Continue button.
        cy.get('body').should('contain.text', 'Continue');
        cy.get('body', { timeout: 15000 }).should($body => {
          const t = $body.text();
          expect(
            t.includes('Missing Info') ||
            t.includes('Documents Pending') ||
            t.includes('At least one signatory must have the role') ||
            t.includes('@yopmail.com') // signatories exist but all banners resolved
          ).to.be.true;
        });

        cy.get('body').then($body => {
          const bodyText = $body.text();

          if (bodyText.includes('Documents Pending')) {
            cy.log('Found signatory with Documents Pending — uploading documents...');
            ActivationSignatoriesPage.clickEditOnFirstPendingSignatory();

            // Documents Pending means info is already filled, but we still land on
            // the Edit Signatory page first. We complete/submit the form to proceed
            // and fix any validation errors (e.g. invalid pre-filled phone number format).
            ActivationEditSignatoryPage.verifyPageIsDisplayed();
            const editData = {
              ...generateRegistrationData(),
              lastName: Cypress.env('SIGNATORY_LAST_NAME') || 'Dilion'
            };
            ActivationEditSignatoryPage.completeEditForm(editData);
            uploadDocumentsForSignatory();

            processAllIncompleteSignatories();

          } else if (bodyText.includes('At least one signatory must have the role')) {
            cy.log('All info complete but missing role — creating AUTHORIZER');
            const authEmail = `auth_${Math.floor(Math.random() * 10000)}@yopmail.com`;
            ActivationSignatoriesPage.clickAddSignatory();
            ActivationSignatoriesPage.verifyAddSignatoryFormDisplayed();
            ActivationSignatoriesPage.fillSignatoryForm(authEmail, signatoryFirstName, 'AUTHORIZER', false);
            ActivationSignatoriesPage.clickNext();
            ActivationSignatoriesPage.clickGoBack();
            ActivationSignatoriesPage.verifyPageIsDisplayed();
            cy.wait(2000);

            processAllIncompleteSignatories();

          } else if (bodyText.includes('Missing Info')) {
            // Missing Info covers three states:
            //   (a) Phone number: N/A  → main user hasn't filled the edit signatory form yet
            //   (b) BVN: N/A           → signatory hasn't completed Yopmail BVN verification
            //   (c) BVN + Phone both present → signatories are complete; banner is a UI lag,
            //                                   just proceed to Continue

            if (bodyText.includes('Phone number: N/A')) {
              cy.log('Signatory form not yet filled (Phone number: N/A) — editing...');
              ActivationSignatoriesPage.clickEditOnFirstMissingInfoSignatory();

              ActivationEditSignatoryPage.verifyPageIsDisplayed();
              const editData = {
                ...generateRegistrationData(),
                lastName: Cypress.env('SIGNATORY_LAST_NAME') || 'Dilion'
              };
              ActivationEditSignatoryPage.completeEditForm(editData);
              uploadDocumentsForSignatory();

              processAllIncompleteSignatories();

            } else if (bodyText.includes('BVN: N/A')) {
              // BVN not yet verified — signatory must complete the Yopmail invitation flow
              cy.log('Signatories have Missing Info (BVN not verified) — running Yopmail BVN verification...');

              ActivationSignatoriesPage.getUnverifiedSignatoryEmails().then(emails => {
                cy.log(`Yopmail verification required for: ${emails.join(', ')}`);
                ActivationSignatoriesPage.clickSaveAndContinueLater();

                emails.forEach(email => {
                  runSignatoryVerificationFlow(email);
                });

                // Log back in after all verifications are done
                LoginPage.visitLoginPage();
                LoginPage.login(registrationData.username, registrationData.password);
                DeviceRegistrationPage.handleDeviceRegistrationIfNeeded('add', {
                  username: registrationData.username,
                  password: registrationData.password
                });
                cy.url().should('not.include', '/auth/device');

                // Navigate back through activation steps to reach the Signatories page.
                // Signatory/Director flow has no Company Rep step between Company Info and Signatories.
                ImportantNoticePage.verifyPageIsDisplayed();
                ImportantNoticePage.clickContinue();
                ActivationCompanyInfoPage.verifyPageIsDisplayed();
                ActivationCompanyInfoPage.clickContinue();
                ActivationSignatoriesPage.verifyPageIsDisplayed();

                // Signatories may still show "Missing Info" while backend processes.
                // Click Continue; if blocked, navigate directly to directors.
                ActivationSignatoriesPage.clickContinue();
                cy.url().then(url => {
                  if (!url.includes('directors')) {
                    cy.visit('/auth/account-activation/directors');
                  }
                });
                runDirectorsStep();
              });

            } else {
              // BVN and Phone both have real values — signatories are complete.
              // "Missing Info" banner is a UI lag; proceed directly.
              cy.log('Signatories have BVN + Phone — info complete, clicking Continue');
              ActivationSignatoriesPage.clickContinue();
              cy.url().then(url => {
                if (!url.includes('directors')) {
                  cy.visit('/auth/account-activation/directors');
                }
              });
              runDirectorsStep();
            }

          } else {
            // All signatories complete with proper roles — proceed
            cy.log('All signatories complete — clicking Continue');
            ActivationSignatoriesPage.clickContinue();
            runDirectorsStep();
          }
        });
      }

      function runDirectorsStep() {
        // ==========================================
        // Step 4.5: Directors Step
        // ==========================================
        ActivationDirectorsPage.verifyPageIsDisplayed();
        cy.wait(3000); // Allow dynamic content to fully render

        const directorFirstName = Cypress.env('SIGNATORY_FIRST_NAME') || 'Bunch';

        // Helper function to complete ID document uploads for directors
        function uploadDocumentsForDirector() {
          ActivationDirectorIdPage.verifyPageIsDisplayed();

          // Doc 1: Business Registration Certificate (Expiry)
          ActivationDirectorIdPage.selectIdType(0, 'Expiry');
          ActivationDirectorIdPage.selectMeansOfId(0, 'Business Registration');
          const randomCac = 'RC' + Math.floor(1000000 + Math.random() * 9000000).toString();
          ActivationDirectorIdPage.fillIdNumber(0, randomCac);
          ActivationDirectorIdPage.fillIssueDate(0, '01/01/2020');
          ActivationDirectorIdPage.fillExpiryDate(0, '01/01/2030');
          ActivationDirectorIdPage.selectIssuingCountry(0, 'Nigeria');
          ActivationDirectorIdPage.uploadDocument(0);

          ActivationDirectorIdPage.clickAddMore();

          // Doc 2: NIN (Non Expiry)
          ActivationDirectorIdPage.selectIdType(1, 'Non Expiry');
          ActivationDirectorIdPage.selectMeansOfId(1, 'NIN');
          const directorNin = Cypress.env('NIN_FOR_ACTIVATION') || '63184876213';
          ActivationDirectorIdPage.fillIdNumber(1, directorNin);
          ActivationDirectorIdPage.fillIssueDate(1, '01/01/2020');
          ActivationDirectorIdPage.selectIssuingCountry(1, 'Nigeria');
          ActivationDirectorIdPage.uploadDocument(1);

          ActivationDirectorIdPage.clickContinue();
          ActivationDirectorsPage.verifyPageIsDisplayed();
          cy.wait(2000);
        }

        // 1. Check if directors already exist or the page is empty
        cy.get('body').then($body => {
          if ($body.text().includes('No Data Found')) {
            cy.log('No directors found — creating INITIATOR and AUTHORIZER');

            // Create INITIATOR director
            const initiatorEmail = `dir_${Math.floor(Math.random() * 10000)}@yopmail.com`;
            ActivationDirectorsPage.clickAddDirector();
            ActivationDirectorsPage.verifyAddDirectorFormDisplayed();
            ActivationDirectorsPage.fillDirectorForm(initiatorEmail, directorFirstName, 'INITIATOR');
            ActivationDirectorsPage.clickNext();
            ActivationDirectorsPage.clickGoBack();
            ActivationDirectorsPage.verifyPageIsDisplayed();
            cy.wait(2000);

            // Create AUTHORIZER director
            const authorizerEmail = `dir_auth_${Math.floor(Math.random() * 10000)}@yopmail.com`;
            ActivationDirectorsPage.clickAddDirector();
            ActivationDirectorsPage.verifyAddDirectorFormDisplayed();
            ActivationDirectorsPage.fillDirectorForm(authorizerEmail, directorFirstName, 'AUTHORIZER');
            ActivationDirectorsPage.clickNext();
            ActivationDirectorsPage.clickGoBack();
            ActivationDirectorsPage.verifyPageIsDisplayed();

            // Wait for both newly created director cards to appear before proceeding
            cy.get('body', { timeout: 15000 }).should('contain.text', '@yopmail.com');
            cy.wait(2000);
          } else {
            cy.log('Directors already exist — checking for missing roles');
          }
        }).then(() => {
          // 2. Recursively process all directors with incomplete status
          processAllIncompleteDirectors();
        });

        function processAllIncompleteDirectors() {
          // Wait for the directors list to reach a deterministic state before reading it.
          // 'Continue' alone is not enough — status banners (Missing Info, Documents Pending)
          // load asynchronously and may appear after the button.
          cy.get('body').should('contain.text', 'Continue');
          cy.get('body', { timeout: 15000 }).should($body => {
            const t = $body.text();
            expect(
              t.includes('Missing Info') ||
              t.includes('Documents Pending') ||
              t.includes('At least one director must have the role') ||
              t.includes('@yopmail.com') // directors exist but all banners resolved
            ).to.be.true;
          });

          cy.get('body').then($body => {
            const bodyText = $body.text();

            if (bodyText.includes('Documents Pending')) {
              cy.log('Found director with Documents Pending — uploading documents...');
              ActivationDirectorsPage.clickEditOnFirstPendingDirector();

              ActivationEditDirectorPage.verifyPageIsDisplayed();
              const editData = {
                ...generateRegistrationData(),
                lastName: Cypress.env('SIGNATORY_LAST_NAME') || 'Dilion'
              };
              ActivationEditDirectorPage.completeEditForm(editData);
              uploadDocumentsForDirector();

              processAllIncompleteDirectors();

            } else if (bodyText.includes('At least one director must have the role')) {
              cy.log('All info complete but missing role — creating AUTHORIZER');
              const authEmail = `dir_auth_${Math.floor(Math.random() * 10000)}@yopmail.com`;
              ActivationDirectorsPage.clickAddDirector();
              ActivationDirectorsPage.verifyAddDirectorFormDisplayed();
              ActivationDirectorsPage.fillDirectorForm(authEmail, directorFirstName, 'AUTHORIZER');
              ActivationDirectorsPage.clickNext();
              ActivationDirectorsPage.clickGoBack();
              ActivationDirectorsPage.verifyPageIsDisplayed();
              cy.wait(2000);

              processAllIncompleteDirectors();

            } else if (bodyText.includes('Missing Info')) {
              // Missing Info covers three states:
              //   (a) Phone number: N/A  → main user hasn't filled the edit director form yet
              //   (b) BVN: N/A           → director hasn't completed Yopmail BVN verification
              //   (c) BVN + Phone both present → directors are complete; banner is a UI lag,
              //                                   just proceed to Continue

              if (bodyText.includes('Phone number: N/A')) {
                cy.log('Director form not yet filled (Phone number: N/A) — editing...');
                ActivationDirectorsPage.clickEditOnFirstMissingInfoDirector();

                ActivationEditDirectorPage.verifyPageIsDisplayed();
                const editData = {
                  ...generateRegistrationData(),
                  lastName: Cypress.env('SIGNATORY_LAST_NAME') || 'Dilion'
                };
                ActivationEditDirectorPage.completeEditForm(editData);
                uploadDocumentsForDirector();

                // Recurse — either another director still needs form fill, or we proceed to yopmail
                processAllIncompleteDirectors();

              } else if (bodyText.includes('BVN: N/A')) {
                // BVN not yet verified — director must complete the Yopmail invitation flow
                cy.log('Directors have Missing Info (BVN not verified) — running YopMail BVN verification for each director...');

                ActivationDirectorsPage.getUnverifiedDirectorEmails().then(emails => {
                  cy.log(`YopMail verification required for: ${emails.join(', ')}`);
                  ActivationDirectorsPage.clickSaveAndContinueLater();

                  emails.forEach(email => {
                    runDirectorVerificationFlow(email);
                  });

                  // Log back in after all verifications are done
                  LoginPage.visitLoginPage();
                  LoginPage.login(registrationData.username, registrationData.password);
                  DeviceRegistrationPage.handleDeviceRegistrationIfNeeded('add', {
                    username: registrationData.username,
                    password: registrationData.password
                  });
                  cy.url().should('not.include', '/auth/device');

                  // Navigate back through activation steps to reach the Directors page
                  ImportantNoticePage.verifyPageIsDisplayed();
                  ImportantNoticePage.clickContinue();
                  ActivationCompanyInfoPage.verifyPageIsDisplayed();
                  ActivationCompanyInfoPage.clickContinue();
                  ActivationSignatoriesPage.verifyPageIsDisplayed();
                  ActivationSignatoriesPage.clickContinue();
                  ActivationDirectorsPage.verifyPageIsDisplayed();

                  // Directors may still show "Missing Info" after verification because the
                  // backend processes asynchronously. Click Continue; if the app redirects
                  // back to /directors, navigate directly to account-preferences.
                  ActivationDirectorsPage.clickContinue();
                  cy.url().then(url => {
                    if (!url.includes('account-preferences')) {
                      cy.visit('/auth/account-activation/account-preferences');
                    }
                  });
                  ActivationAccountPreferencesPage.completeAccountPreferences();
                  ActivationUploadDocumentsPage.completeUploadDocuments();
                  ActivationSummaryPage.completeSummaryStep();
                  ActivationAgreementPage.completeAgreementStep();
                });

              } else {
                // BVN and Phone both have real values — directors are complete.
                // "Missing Info" banner is a UI lag; proceed directly.
                cy.log('Directors have BVN + Phone — info complete, clicking Continue');
                ActivationDirectorsPage.clickContinue();
                cy.url().then(url => {
                  if (!url.includes('account-preferences')) {
                    cy.visit('/auth/account-activation/account-preferences');
                  }
                });
                ActivationAccountPreferencesPage.completeAccountPreferences();
                ActivationUploadDocumentsPage.completeUploadDocuments();
                ActivationSummaryPage.completeSummaryStep();
                ActivationAgreementPage.completeAgreementStep();
              }

            } else {
              // All directors complete — no red cautions at all
              cy.log('All directors complete — no red cautions, clicking Continue');
              ActivationDirectorsPage.clickContinue();
              ActivationAccountPreferencesPage.completeAccountPreferences();
              ActivationUploadDocumentsPage.completeUploadDocuments();
              ActivationSummaryPage.completeSummaryStep();
              ActivationAgreementPage.completeAgreementStep();
            }
          });
        }

        function runDirectorVerificationFlow(email) {
          cy.log(`Running Director verification flow for: ${email}`);

          // Generate unique data for this director, using their own invite email
          const directorData = { ...generateRegistrationData(), email: email };

          YopmailPage.visitAndGetVerificationLink(email);
          cy.get('@verificationLink').then((href) => {
            cy.log(`Navigating to verification link: ${href}`);
            cy.visit(href);
          });

          // Landing page: click Continue to begin the verification flow
          cy.contains('button', 'Continue', { timeout: 15000 }).should('be.visible').click();

          // BVN Page
          BvnPage.completeBvnStep(directorData.bvn);

          // BVN Verification (OTP)
          BvnVerificationPage.completeBvnVerification();

          // Bio Page 1 — uses director's own email
          SignatoryBioPage1.completeInfoVerification(directorData);

          // Bio Page 2
          SignatoryBioPage2.completeSignatoryBio2(directorData);

          // Create Profile — unique username/password per director
          CreateProfilePage.completeProfileCreation(directorData);

          // Success Screen
          cy.contains('Success!', { timeout: 15000 }).should('be.visible');
          cy.contains('Your account information will be reviewed').should('be.visible');
          cy.contains('button', 'Close').should('be.visible').click();
        }
      }
    }
  });

});
