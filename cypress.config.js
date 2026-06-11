const { defineConfig } = require('cypress');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const environments = {
  staging: {
    baseUrl: 'https://lucid-corporate.digicoreltds.com',
    otpCode: '123456',
    passcode: '654321'
  },
  prod: {
    baseUrl: 'https://www.lucid-prod.com',
    otpCode: '',   // TODO: Set prod OTP code
    passcode: ''   // TODO: Set prod passcode
  }
};

module.exports = defineConfig({
  reporter: 'cypress-mochawesome-reporter',

  pageLoadTimeout: 100000,
  defaultCommandTimeout: 100000,
  watchForFileChanges: false,

  viewportWidth: 1280,
  viewportHeight: 720,

  video: false,
  screenshotOnRunFailure: true,
  screenshotsFolder: 'reports/screenshots',
  videosFolder: 'reports/videos',

  chromeWebSecurity: false,

  e2e: {
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    supportFile: 'cypress/support/e2e.js',
    experimentalModifyObstructiveThirdPartyCode: true,

    setupNodeEvents(on, config) {
      require('cypress-mochawesome-reporter/plugin')(on);

      on('before:browser:launch', (browser = {}, launchOptions) => {
        if (browser.family === 'chromium' || browser.name === 'chrome') {
          launchOptions.args.push('--disable-gpu');
          launchOptions.args.push('--disable-dev-shm-usage');
          launchOptions.args.push('--disable-extensions');
          launchOptions.args.push('--no-sandbox');
        }
        return launchOptions;
      });

      // --------------------------------------------------
      // Node task: Save new user credentials after signup
      // --------------------------------------------------
      on('task', {
        saveNewUserCredentials(data) {
          const filePath = path.resolve('cypress/fixtures/newUser.json');
          let dataToSave;
          if (!data || Object.keys(data).length === 0) {
            dataToSave = {};
          } else {
            dataToSave = {
              ...data,
              createdAt: new Date().toISOString()
            };
          }
          fs.writeFileSync(filePath, JSON.stringify(dataToSave, null, 2));
          console.log(`New user credentials saved to ${filePath}`);

          const username = data?.username || '';
          const password = data?.password || '';

          // Also update .env file with NEW_USER_USERNAME and NEW_USER_PASSWORD
          const envPath = path.resolve('.env');
          if (fs.existsSync(envPath)) {
            let content = fs.readFileSync(envPath, 'utf-8');
            
            const usernameRegex = /^NEW_USER_USERNAME=.*/m;
            if (usernameRegex.test(content)) {
              content = content.replace(usernameRegex, `NEW_USER_USERNAME=${username}`);
            } else {
              content += `\nNEW_USER_USERNAME=${username}`;
            }

            const passwordRegex = /^NEW_USER_PASSWORD=.*/m;
            if (passwordRegex.test(content)) {
              content = content.replace(passwordRegex, `NEW_USER_PASSWORD=${password}`);
            } else {
              content += `\nNEW_USER_PASSWORD=${password}`;
            }

            fs.writeFileSync(envPath, content, 'utf-8');
            console.log(`NEW_USER_USERNAME and NEW_USER_PASSWORD updated in .env`);
          } else {
            console.error('.env file not found — cannot write new user credentials to .env');
          }

          // Also update process.env
          process.env.NEW_USER_USERNAME = username;
          process.env.NEW_USER_PASSWORD = password;

          return data;
        },

        readNewUserCredentials() {
          const filePath = path.resolve('cypress/fixtures/newUser.json');
          if (fs.existsSync(filePath)) {
            const raw = fs.readFileSync(filePath, 'utf-8');
            return JSON.parse(raw);
          }
          return null;
        },

        /**
         * Updates the EXISTING_USER_PASSWORD in the .env file.
         * Called after a successful forgot-password reset so that
         * subsequent test runs use the new password automatically.
         */
        updateEnvPassword(newPassword) {
          const envPath = path.resolve('.env');
          if (!fs.existsSync(envPath)) {
            console.error('.env file not found — cannot update password');
            return null;
          }

          let content = fs.readFileSync(envPath, 'utf-8');
          const regex = /^EXISTING_USER_PASSWORD=.*/m;

          if (regex.test(content)) {
            content = content.replace(regex, `EXISTING_USER_PASSWORD=${newPassword}`);
          } else {
            // Append if the key doesn't exist yet
            content += `\nEXISTING_USER_PASSWORD=${newPassword}\n`;
          }

          fs.writeFileSync(envPath, content, 'utf-8');

          // Also update process.env so subsequent specs pick up the new password
          // (dotenv only loads .env once at startup, so process.env would be stale otherwise)
          process.env.EXISTING_USER_PASSWORD = newPassword;

          console.log(`EXISTING_USER_PASSWORD updated in .env and process.env`);
          return newPassword;
        },

        /**
         * Reads credentials directly from the .env file on disk.
         * Use this instead of Cypress.env() when the password may have
         * been changed by a prior spec (e.g. forgot-password flow).
         */
        readEnvCredentials() {
          const envPath = path.resolve('.env');
          if (!fs.existsSync(envPath)) {
            console.error('.env file not found');
            return { username: '', password: '', transactionPin: '' };
          }

          const content = fs.readFileSync(envPath, 'utf-8');
          const usernameMatch = content.match(/^EXISTING_USER_USERNAME=(.*)$/m);
          const passwordMatch = content.match(/^EXISTING_USER_PASSWORD=(.*)$/m);
          const pinMatch = content.match(/^TRANSACTION_PIN=(.*)$/m);

          return {
            username: usernameMatch ? usernameMatch[1].trim() : '',
            password: passwordMatch ? passwordMatch[1].trim() : '',
            transactionPin: pinMatch ? pinMatch[1].trim() : ''
          };
        },

        /**
         * Reads new user credentials directly from the .env file on disk.
         * Use this instead of Cypress.env() when the credentials may have
         * been updated in the same run.
         */
        readNewUserEnvCredentials() {
          const envPath = path.resolve('.env');
          if (!fs.existsSync(envPath)) {
            console.error('.env file not found');
            return { username: '', password: '' };
          }

          const content = fs.readFileSync(envPath, 'utf-8');
          const usernameMatch = content.match(/^NEW_USER_USERNAME=(.*)$/m);
          const passwordMatch = content.match(/^NEW_USER_PASSWORD=(.*)$/m);

          return {
            username: usernameMatch ? usernameMatch[1].trim() : '',
            password: passwordMatch ? passwordMatch[1].trim() : ''
          };
        }
      });

      const envName = config.env.APP_ENV || 'staging';

      if (!environments[envName]) {
        throw new Error(
          `Invalid APP_ENV: "${envName}". Valid options are: ${Object.keys(environments).join(', ')}`
        );
      }

      config.baseUrl = environments[envName].baseUrl;

      config.env = {
        ...config.env,
        ...process.env,
        APP_ENV: envName,
        OTP_CODE: environments[envName].otpCode,
        PASSCODE: environments[envName].passcode,
        // Existing user credentials from .env
        EXISTING_USER_USERNAME: process.env.EXISTING_USER_USERNAME || '',
        EXISTING_USER_PASSWORD: process.env.EXISTING_USER_PASSWORD || '',
        EXISTING_USER_EMAIL: process.env.EXISTING_USER_EMAIL || '',
        // New user credentials from .env (populated after registration)
        NEW_USER_USERNAME: process.env.NEW_USER_USERNAME || '',
        NEW_USER_PASSWORD: process.env.NEW_USER_PASSWORD || '',
        // Activation NIN and signatory static data from .env
        NIN_FOR_ACTIVATION: process.env.NIN_FOR_ACTIVATION || '',
        SIGNATORY_FIRST_NAME: process.env.SIGNATORY_FIRST_NAME || 'Bunch',
        SIGNATORY_LAST_NAME: process.env.SIGNATORY_LAST_NAME || 'Dilion',
      };

      console.log(`Running Cypress tests in "${envName}" environment`);
      console.log(`Base URL: ${config.baseUrl}`);

      return config;
    }
  }
});