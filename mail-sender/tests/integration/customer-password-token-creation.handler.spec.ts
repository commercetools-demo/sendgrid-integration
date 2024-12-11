import { faker } from '@faker-js/faker';

import { expect } from '@jest/globals';
import { CustomerPasswordTokenCreatedMessage } from '@commercetools/platform-sdk';
import { handleCustomerPasswordTokenCreated } from '../../src/handlers/customer-password-token-creation.handler';
import {
  readAdditionalConfiguration,
  readConfiguration,
} from '../../src/utils/config.utils';
import { createApiRoot } from '../../src/client/create.client';
import { Customer, type TCustomer } from '@commercetools-test-data/customer';

jest.mock('../../src/client/create.client', () => {
  const mockCreateApiRoot = jest.fn();
  return {
    createApiRoot: mockCreateApiRoot,
  };
});

jest.mock('../../src/utils/config.utils');

describe('Testing Customer Password Reset', () => {
  beforeEach(() => {
    (readConfiguration as jest.Mock).mockClear();
    (readAdditionalConfiguration as jest.Mock).mockClear();
  });
  it('Customer Password Reset', async () => {
    const customerId = faker.string.uuid();
    const passwordToken = faker.string.sample();
    const customer = Customer.random().build<TCustomer>();

    // Define a mock root to be returned
    const withId = jest.fn().mockReturnValueOnce({
      get: jest.fn().mockReturnValueOnce({
        execute: jest
          .fn()
          .mockReturnValueOnce(Promise.resolve({ body: customer })),
      }),
    });
    const passwordTokenPost = jest.fn().mockReturnValue({
      execute: jest.fn().mockReturnValueOnce(
        Promise.resolve({
          body: {
            id: faker.string.uuid(),
            customerId: customerId,
            value: passwordToken,
            expiresAt: faker.date.future().toISOString(),
            createdAt: faker.date.past().toISOString(),
          },
        })
      ),
    });
    const customerPasswordToken = jest.fn().mockReturnValue({
      post: passwordTokenPost,
    });
    const mockRoot = {
      customers: jest.fn().mockReturnValue({
        withId: withId,
        passwordToken: customerPasswordToken,
      }),
    };

    // Set the mock implementation for createApiRoot to return mockRoot
    (createApiRoot as jest.Mock).mockReturnValue(mockRoot);

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
      customerPasswordTokenCreatedMessage,
      []
    );

    expect(passwordTokenPost).toBeCalledWith({
      body: expect.objectContaining({ email: customer.email }),
    });
    expect(result?.templateData['customerPasswordToken']).toEqual(
      passwordToken
    );
    expect(
      result?.templateData['customerPasswordTokenValidityDate']
    ).toBeDefined();
    expect(
      result?.templateData['customerPasswordTokenValidityTime']
    ).toBeDefined();
  });
});
