import { faker } from '@faker-js/faker';

import { expect } from '@jest/globals';
import { CustomerPasswordTokenCreatedMessage } from '@commercetools/platform-sdk';
import { handleCustomerPasswordTokenCreated } from '../../src/handlers/customer-password-token-creation.handler';

describe('Testing Customer Password Reset', () => {
  it('Customer Password Reset', async () => {
    const customerId = 'f52e4230-a1f9-4f49-b6eb-af33fba3ddad';

    const customerPasswordTokenCreatedMessage: CustomerPasswordTokenCreatedMessage =
      {
        createdAt: faker.date.past().toISOString(),
        id: faker.string.uuid(),
        lastModifiedAt: faker.date.past().toISOString(),
        resource: { id: customerId, typeId: 'customer' },
        resourceVersion: faker.number.int(),
        sequenceNumber: faker.number.int(),
        type: 'CustomerPasswordTokenCreated',
        version: faker.number.int(),
        customerId: customerId,
        expiresAt: '',
      };

    const result = await handleCustomerPasswordTokenCreated(
      customerPasswordTokenCreatedMessage
    );

    expect(result.templateData['customerPasswordToken']).toBeDefined();
    expect(
      result.templateData['customerPasswordTokenValidityDate']
    ).toBeDefined();
    expect(
      result.templateData['customerPasswordTokenValidityTime']
    ).toBeDefined();
  });
});
