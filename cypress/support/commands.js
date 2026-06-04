/// <reference types="cypress" />

/**
 * Grants geolocation permission and sets a fake location via Chrome DevTools Protocol.
 * This prevents the browser's "Know your location" prompt from appearing.
 * Default coordinates: Lagos, Nigeria.
 */
Cypress.Commands.add('grantGeolocation', (latitude = 6.5244, longitude = 3.3792, accuracy = 100) => {
  cy.log(`Granting geolocation: ${latitude}, ${longitude}`)

  // Grant geolocation permission via CDP
  Cypress.automation('remote:debugger:protocol', {
    command: 'Browser.grantPermissions',
    params: {
      permissions: ['geolocation'],
      origin: Cypress.config('baseUrl'),
    },
  })

  // Set fake geolocation coordinates via CDP
  Cypress.automation('remote:debugger:protocol', {
    command: 'Emulation.setGeolocationOverride',
    params: {
      latitude,
      longitude,
      accuracy,
    },
  })
})
