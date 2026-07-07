import { faker } from '@faker-js/faker';

/**
 * Generates a password that always satisfies:
 * - Minimum 12 characters
 * - At least one uppercase letter
 * - At least one number
 * - At least one special character
 */
const generateStrongPassword = () => {
  const uppercase = faker.string.alpha({ length: 1, casing: 'upper' });
  const lowercase = faker.string.alpha({ length: 8, casing: 'lower' });
  const number = faker.string.numeric(1);
  const special = faker.helpers.arrayElement(['@', '#', '$', '&']);
  const extra = faker.string.alphanumeric(4);
  return faker.helpers
      .shuffle((uppercase + lowercase + number + special + extra).split(''))
      .join('');
};

/**
 * Generates a valid 11-digit BVN (Bank Verification Number) for testing.
 * Note: This generates a random 11-digit number — not a real BVN.
 */
const generateBvn = () => {
  return '22' + faker.string.numeric(9);
};

/**
 * Generates a random full name for generic inputs like 'Name on card'.
 */
export const generateRandomName = () => {
  return faker.person.fullName();
};

/**
 * Generate test data for signatory/director registration.
 * Customize the fields below to match Lucid Business Banking forms.
 */
export const generateRegistrationData = () => {
  return {
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    email: faker.internet.email(),
    username: faker.person.firstName().toLowerCase() + faker.string.numeric(3),
    password: generateStrongPassword(),
    phoneNumber:
        faker.helpers.arrayElement(["90", "80", "81"]) +
        faker.string.numeric(8),
    companyName: faker.company.name().replace(/[^a-zA-Z0-9 ]/g, ''),
    bvn: generateBvn(),
    title: faker.helpers.arrayElement(['Mr.', 'Mrs.']),
    address: faker.location.streetAddress(),
    mothersMaidenName: faker.person.lastName(),
    companyEmail: faker.internet.email(),
    registrationNumber: 'RC' + faker.string.numeric(7),
    tin: faker.string.numeric(10),
    businessNature: faker.helpers.arrayElement([
      'Financial Services', 'Technology', 'Consulting',
      'Retail', 'Manufacturing', 'Real Estate', 'Agriculture'
    ]),
    companyAddress: faker.location.streetAddress(),
    companyPhoneNumber:
        '0' + faker.helpers.arrayElement(["90", "80", "81"]) +
        faker.string.numeric(8),
  };
};
