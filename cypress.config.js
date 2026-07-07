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
  projectId: 'hodbux',
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
        // Fetch Yopmail inbox from Node.js (no browser) to avoid ESOCKETTIMEDOUT.
        // cy.visit() on yopmail.com gets blocked at TCP level by anti-bot measures;
        // a plain Node.js HTTPS request is treated as a regular HTTP client.
        async getYopmailVerificationLink({ email, maxAttempts = 12, delayMs = 5000 }) {
          const https = require('https');
          const username = email.split('@')[0];

          function makeRequest(urlStr, cookieStr = '') {
            return new Promise((resolve, reject) => {
              const url = new URL(urlStr);
              const options = {
                hostname: url.hostname,
                path: url.pathname + url.search,
                method: 'GET',
                timeout: 20000,
                headers: {
                  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
                  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                  'Accept-Language': 'en-US,en;q=0.5',
                  'Accept-Encoding': 'identity',
                  'Connection': 'keep-alive',
                  ...(cookieStr ? { 'Cookie': cookieStr } : {})
                }
              };
              const req = https.request(options, (res) => {
                const setCookies = res.headers['set-cookie'] || [];
                let body = '';
                res.setEncoding('utf8');
                res.on('data', chunk => { body += chunk; });
                res.on('end', () => resolve({ statusCode: res.statusCode, headers: res.headers, setCookies, body }));
              });
              req.on('error', reject);
              req.on('timeout', () => req.destroy(new Error(`Request to ${urlStr} timed out`)));
              req.end();
            });
          }

          function parseCookies(setCookieArray) {
            const map = {};
            setCookieArray.forEach(str => {
              const [kv] = str.split(';');
              const eqIdx = kv.indexOf('=');
              if (eqIdx > 0) map[kv.slice(0, eqIdx).trim()] = kv.slice(eqIdx + 1).trim();
            });
            return map;
          }

          function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

          // Step 1: Get main page cookies
          console.log(`[Yopmail] Starting session for ${email}`);
          const initResp = await makeRequest('https://yopmail.com/en/');
          const cookies = parseCookies(initResp.setCookies);
          console.log(`[Yopmail] Cookies from homepage: ${JSON.stringify(Object.keys(cookies))}`);

          // Step 2: Visit the login page WITH the username — this is what actually
          // establishes the server-side inbox session. Without this step, the inbox
          // endpoint returns nothing even if the ywm cookie is set manually.
          const loginResp = await makeRequest(
            `https://yopmail.com/en/?login=${encodeURIComponent(username)}`,
            Object.entries(cookies).map(([k, v]) => `${k}=${v}`).join('; ')
          );
          // Merge any new cookies from the login page
          Object.assign(cookies, parseCookies(loginResp.setCookies));
          cookies['ywm'] = username;

          const cookieStr = Object.entries(cookies).map(([k, v]) => `${k}=${v}`).join('; ');
          // Yopmail renamed their session cookies: yp→yc, ys→yses.
          // The inbox URL query params are still named yp/ys, so map accordingly.
          const yp = cookies['yp'] || cookies['yc']   || '';
          const ys = cookies['ys'] || cookies['yses'] || '';
          const y  = cookies['y']  || '';
          console.log(`[Yopmail] Session tokens — yp: "${yp}", ys: "${ys}", y: "${y}"`);

          // URL regex — stop at whitespace, quotes, angle brackets, or square brackets
          const linkRegex = /(https?:\/\/[^\s"<>\[\]]+\/auth\/onboarding\/[^\s"<>\[\]]+)/;

          for (let attempt = 0; attempt < maxAttempts; attempt++) {
            if (attempt > 0) await sleep(delayMs);
            console.log(`[Yopmail] Polling inbox for ${username} (attempt ${attempt + 1}/${maxAttempts})`);

            try {
              const ts = Date.now();
              // yp/ys values can contain +, / and = (base64 chars) — must be encoded
              const inboxUrl = `https://yopmail.com/en/inbox?login=${encodeURIComponent(username)}&p=1&d=&ctrl=&scrl=&spam=false&nc=1&yp=${encodeURIComponent(yp)}&ys=${encodeURIComponent(ys)}&y=${encodeURIComponent(y)}&_=${ts}`;
              const inboxResp = await makeRequest(inboxUrl, cookieStr);

              // DEBUG: log a slice of the inbox response so we can see what Yopmail returns
              console.log(`[Yopmail] Inbox response status: ${inboxResp.statusCode}`);
              console.log(`[Yopmail] Inbox HTML (first 600 chars): ${inboxResp.body.slice(0, 600)}`);

              // Yopmail inbox HTML contains onclick="lire('EMAIL_ID')" on each email row
              const idMatches = [...inboxResp.body.matchAll(/lire\('([^']+)'\)/g)];
              if (idMatches.length === 0) {
                console.log(`[Yopmail] No lire() patterns found — inbox empty or HTML structure changed`);
                continue;
              }

              for (const idMatch of idMatches) {
                const mailUrl = `https://yopmail.com/en/mail.php?login=${encodeURIComponent(username)}&id=${idMatch[1]}`;
                try {
                  const mailResp = await makeRequest(mailUrl, cookieStr);
                  console.log(`[Yopmail] Email HTML (first 600 chars): ${mailResp.body.slice(0, 600)}`);
                  const linkMatch = mailResp.body.match(linkRegex);
                  if (linkMatch) {
                    console.log(`[Yopmail] Found verification link: ${linkMatch[1]}`);
                    return linkMatch[1];
                  }
                } catch (e) {
                  console.error(`[Yopmail] Error reading email ${idMatch[1]}:`, e.message);
                }
              }
              console.log(`[Yopmail] Emails found but no onboarding link yet, retrying...`);
            } catch (e) {
              console.error(`[Yopmail] Inbox fetch error:`, e.message);
            }
          }

          throw new Error(`[Yopmail] No verification link found for ${email} after ${maxAttempts} attempts`);
        },
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

        saveCompRepSignupCredentials(data) {
          const envPath = path.resolve('.env');
          const username = data?.username || '';
          const password = data?.password || '';

          if (fs.existsSync(envPath)) {
            let content = fs.readFileSync(envPath, 'utf-8');

            const uRx = /^NEW_COMP_REP_USERNAME=.*/m;
            content = uRx.test(content)
              ? content.replace(uRx, `NEW_COMP_REP_USERNAME=${username}`)
              : content + `\nNEW_COMP_REP_USERNAME=${username}`;

            const pRx = /^NEW_COMP_REP_PASSWORD=.*/m;
            content = pRx.test(content)
              ? content.replace(pRx, `NEW_COMP_REP_PASSWORD=${password}`)
              : content + `\nNEW_COMP_REP_PASSWORD=${password}`;

            fs.writeFileSync(envPath, content, 'utf-8');
            process.env.NEW_COMP_REP_USERNAME = username;
            process.env.NEW_COMP_REP_PASSWORD = password;
            console.log(`NEW_COMP_REP_USERNAME and NEW_COMP_REP_PASSWORD saved to .env`);
          } else {
            console.error('.env file not found — cannot save company rep signup credentials');
          }

          return data;
        },

        readCompRepSignupCredentials() {
          const envPath = path.resolve('.env');
          if (!fs.existsSync(envPath)) return { username: '', password: '' };
          const content = fs.readFileSync(envPath, 'utf-8');
          const uMatch = content.match(/^NEW_COMP_REP_USERNAME=(.*)$/m);
          const pMatch = content.match(/^NEW_COMP_REP_PASSWORD=(.*)$/m);
          return {
            username: uMatch ? uMatch[1].trim() : '',
            password: pMatch ? pMatch[1].trim() : ''
          };
        },

        saveSignatorySignupCredentials(data) {
          const envPath = path.resolve('.env');
          const username = data?.username || '';
          const password = data?.password || '';

          if (fs.existsSync(envPath)) {
            let content = fs.readFileSync(envPath, 'utf-8');

            const uRx = /^NEW_SIGNATORY_USERNAME=.*/m;
            content = uRx.test(content)
              ? content.replace(uRx, `NEW_SIGNATORY_USERNAME=${username}`)
              : content + `\nNEW_SIGNATORY_USERNAME=${username}`;

            const pRx = /^NEW_SIGNATORY_PASSWORD=.*/m;
            content = pRx.test(content)
              ? content.replace(pRx, `NEW_SIGNATORY_PASSWORD=${password}`)
              : content + `\nNEW_SIGNATORY_PASSWORD=${password}`;

            fs.writeFileSync(envPath, content, 'utf-8');
            process.env.NEW_SIGNATORY_USERNAME = username;
            process.env.NEW_SIGNATORY_PASSWORD = password;
            console.log(`NEW_SIGNATORY_USERNAME and NEW_SIGNATORY_PASSWORD saved to .env`);
          } else {
            console.error('.env file not found — cannot save signatory signup credentials');
          }

          return data;
        },

        readSignatorySignupCredentials() {
          const envPath = path.resolve('.env');
          if (!fs.existsSync(envPath)) return { username: '', password: '' };
          const content = fs.readFileSync(envPath, 'utf-8');
          const uMatch = content.match(/^NEW_SIGNATORY_USERNAME=(.*)$/m);
          const pMatch = content.match(/^NEW_SIGNATORY_PASSWORD=(.*)$/m);
          return {
            username: uMatch ? uMatch[1].trim() : '',
            password: pMatch ? pMatch[1].trim() : ''
          };
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
         * Calls dotenv.config({ override: true }) on every invocation so that
         * any password change written by a prior spec (e.g. forgot-password flow)
         * is always reflected — process.env is never stale.
         */
        readEnvCredentials() {
          const envPath = path.resolve('.env');
          if (!fs.existsSync(envPath)) {
            console.error('.env file not found');
            return { username: '', password: '', transactionPin: '' };
          }

          // Force-reload .env so process.env always has the latest values,
          // even if the password was rotated by an earlier spec in the same run.
          require('dotenv').config({ path: envPath, override: true });

          return {
            username: process.env.EXISTING_USER_USERNAME?.trim() || '',
            password: process.env.EXISTING_USER_PASSWORD?.trim() || '',
            transactionPin: process.env.TRANSACTION_PIN?.trim() || ''
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
        },

        readActivationCredentials({ usernameKey, passwordKey }) {
          const envPath = path.resolve('.env');
          if (!fs.existsSync(envPath)) {
            return { username: '', password: '' };
          }
          require('dotenv').config({ path: envPath, override: true });
          return {
            username: process.env[usernameKey]?.trim() || '',
            password: process.env[passwordKey]?.trim() || ''
          };
        },

        saveActivationCredentials({ usernameKey, passwordKey, fixtureFile, data }) {
          const envPath = path.resolve('.env');
          const username = data?.username || '';
          const password = data?.password || '';

          // Guard: never save existing-user credentials as activation credentials
          const existingUsername = (process.env.EXISTING_USER_USERNAME || '').trim().toLowerCase();
          if (existingUsername && username.toLowerCase() === existingUsername) {
            console.error(`saveActivationCredentials: refused to save existing user "${username}" as ${usernameKey}`);
            return null;
          }

          if (fs.existsSync(envPath)) {
            let content = fs.readFileSync(envPath, 'utf-8');

            const usernameRegex = new RegExp(`^${usernameKey}=.*$`, 'm');
            content = usernameRegex.test(content)
              ? content.replace(usernameRegex, `${usernameKey}=${username}`)
              : content + `\n${usernameKey}=${username}`;

            const passwordRegex = new RegExp(`^${passwordKey}=.*$`, 'm');
            content = passwordRegex.test(content)
              ? content.replace(passwordRegex, `${passwordKey}=${password}`)
              : content + `\n${passwordKey}=${password}`;

            fs.writeFileSync(envPath, content, 'utf-8');
            process.env[usernameKey] = username;
            process.env[passwordKey] = password;
            console.log(`${usernameKey} and ${passwordKey} saved to .env`);
          } else {
            console.error('.env file not found — cannot save activation credentials');
          }

          const fixturePath = path.resolve(`cypress/fixtures/${fixtureFile}`);
          fs.writeFileSync(fixturePath, JSON.stringify({ ...data, savedAt: new Date().toISOString() }, null, 2));
          console.log(`Activation fixture saved to ${fixturePath}`);

          return data;
        },

        readActivationFixture({ fixtureFile }) {
          const fixturePath = path.resolve(`cypress/fixtures/${fixtureFile}`);
          if (!fs.existsSync(fixturePath)) return null;
          try {
            return JSON.parse(fs.readFileSync(fixturePath, 'utf-8'));
          } catch (e) {
            return null;
          }
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
        // Per-flow new user credentials (company rep vs signatory signup)
        NEW_COMP_REP_USERNAME: process.env.NEW_COMP_REP_USERNAME || '',
        NEW_COMP_REP_PASSWORD: process.env.NEW_COMP_REP_PASSWORD || '',
        NEW_SIGNATORY_USERNAME: process.env.NEW_SIGNATORY_USERNAME || '',
        NEW_SIGNATORY_PASSWORD: process.env.NEW_SIGNATORY_PASSWORD || '',
        // Per-spec activation credentials
        ACTIVATION_REP_USERNAME: process.env.ACTIVATION_REP_USERNAME || '',
        ACTIVATION_REP_PASSWORD: process.env.ACTIVATION_REP_PASSWORD || '',
        ACTIVATION_SIG_USERNAME: process.env.ACTIVATION_SIG_USERNAME || '',
        ACTIVATION_SIG_PASSWORD: process.env.ACTIVATION_SIG_PASSWORD || '',
        ACTIVATION_SKIP_REP_USERNAME: process.env.ACTIVATION_SKIP_REP_USERNAME || '',
        ACTIVATION_SKIP_REP_PASSWORD: process.env.ACTIVATION_SKIP_REP_PASSWORD || '',
        ACTIVATION_SKIP_SIG_USERNAME: process.env.ACTIVATION_SKIP_SIG_USERNAME || '',
        ACTIVATION_SKIP_SIG_PASSWORD: process.env.ACTIVATION_SKIP_SIG_PASSWORD || '',
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