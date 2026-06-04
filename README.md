# Lucid Business Banking - UI Automation

Cypress-based UI automation framework for **Lucid Business Banking** (`lucid-corporate.digicoreltds.com`).

## Project Structure

```
Lucid-Business-Banking-UI-Automation/
├── cypress.config.js              # Multi-environment Cypress configuration
├── Jenkinsfile                    # CI/CD pipeline definition
├── package.json                   # Dependencies and scripts
├── .gitignore
├── cypress/
│   ├── e2e/
│   │   └── regression/            # Regression test specs
│   ├── pages/                     # Page Object Model classes
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

# Open Cypress Test Runner (interactive mode)
npx cypress open

# Run tests in headless mode (staging)
npm run staging-ui-test

# Run tests in headless mode (production)
npm run prod-ui-test
```

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
