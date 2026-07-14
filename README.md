# Lucid Business Banking - UI Automation

Cypress-based UI automation framework for **Lucid Business Banking** (`lucid-corporate.digicoreltds.com`).

## Project Structure

```
Lucid-Business-Banking-UI-Automation/
├── cypress.config.js              # Multi-environment Cypress configuration
├── Jenkinsfile                    # CI/CD pipeline definition
├── package.json                   # Dependencies and scripts
├── .env.example                   # Template for required credentials — copy to .env
├── .gitignore
├── cypress/
│   ├── e2e/
│   │   └── regression/            # Regression test specs (Login, Signup, Activation,
│   │                               #   Dashboard, Accounts, Airtime, Transfers, Card Management)
│   ├── pages/                     # Page Object Model classes (one subfolder per module)
│   ├── fixtures/                  # Static test data (JSON)
│   ├── utils/
│   │   ├── dataBuilder.js         # Dynamic test data generation (Faker.js)
│   │   └── logger.js              # Custom logging utility
│   └── support/
│       ├── commands.js            # Cypress custom commands
│       └── e2e.js                 # Global hooks (before/after)
└── reports/                       # Auto-generated test reports
```

## Prerequisites

- **Node.js** >= 18
- **npm** >= 9

## Getting Started

```bash
# Install dependencies
npm install

# Copy the credentials template and fill in real values (see below)
cp .env.example .env

# Open Cypress Test Runner (interactive mode)
npx cypress open

# Run tests in headless mode (staging)
npm run staging-ui-test

# Run tests in headless mode (production)
npm run prod-ui-test
```

## Credentials Setup

Most specs log in via `cy.task('readEnvCredentials')`, which reads from a git-ignored `.env` file at the project root. Tests will fail immediately if it's missing. Copy `.env.example` to `.env` and fill in:

- `EXISTING_USER_USERNAME` / `EXISTING_USER_PASSWORD` / `EXISTING_USER_EMAIL` — a known account used by login, dashboard, accounts, airtime, transfers, and card management specs
- `NIN_FOR_ACTIVATION`, `SIGNATORY_FIRST_NAME`, `SIGNATORY_LAST_NAME` — static verification data used during signatory/director activation
- `NEW_USER_USERNAME` / `NEW_USER_PASSWORD` — left blank; auto-populated by the signup specs after a fresh registration and reused on subsequent runs
- `TRANSACTION_PIN` — the transaction PIN for the existing user, required by any spec that confirms a transfer, airtime purchase, or card request

## Environment Configuration

| Environment | URL | Script |
|---|---|---|
| Staging | `https://lucid-corporate.digicoreltds.com` | `npm run staging-ui-test` |
| Production | TBD | `npm run prod-ui-test` |

The environment is controlled via the `APP_ENV` variable. You can also set it directly:

```bash
npx cypress run --env APP_ENV=staging
```

## Writing Tests

1. **Create a Page Object** in `cypress/pages/` for each page under test
2. **Create a Test Spec** in `cypress/e2e/regression/` using the page objects
3. **Generate test data** using `cypress/utils/dataBuilder.js`
4. **Use the Logger** (`cypress/utils/logger.js`) for clear step-by-step logging

## Reports

Tests use **Mochawesome Reporter**. Reports are generated in the `reports/` directory after each run.
