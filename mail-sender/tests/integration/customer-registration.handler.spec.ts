import { Customer, type TCustomer } from '@commercetools-test-data/customer';
import { faker } from '@faker-js/faker';

import { handleCustomerCreated } from '../../src/handlers/customer-registration.handler';
import { expect } from '@jest/globals';
import {
  readAdditionalConfiguration,
  readConfiguration,
} from '../../src/utils/config.utils';
import { CustomerCreatedMessage } from '@commercetools/platform-sdk';
import { createApiRoot } from '../../src/client/create.client';

jest.mock('../../src/client/create.client', () => {
  const mockCreateApiRoot = jest.fn();
  return {
    createApiRoot: mockCreateApiRoot,
  };
});

jest.mock('../../src/utils/config.utils');

describe('Testing Customer Registration', () => {
  beforeEach(() => {
    (readConfiguration as jest.Mock).mockClear();
    (readAdditionalConfiguration as jest.Mock).mockClear();
  });

  it('Customer Created', async () => {
    const customer = Customer.random().isEmailVerified(true).build<TCustomer>();
    const customerCreatedMessage: CustomerCreatedMessage = {
      createdAt: faker.date.past().toISOString(),
      id: faker.string.uuid(),
      lastModifiedAt: faker.date.past().toISOString(),
      resource: { id: faker.string.uuid(), typeId: 'customer' },
      resourceVersion: faker.number.int(),
      sequenceNumber: faker.number.int(),
      type: 'CustomerCreated',
      version: faker.number.int(),
      customer: customer,
    };

    const result = await handleCustomerCreated(customerCreatedMessage, []);
    expect(result?.recipientEmailAddresses[0]).toEqual(customer.email);
    expect(result?.templateId).toEqual(
      readAdditionalConfiguration().customerRegistrationTemplateId
    );
    expect(result?.templateData).toEqual(
      expect.objectContaining({
        customerEmail: customer.email,
        customerNumber: customer.customerNumber || '',
        customerFirstName: customer.firstName || '',
        customerLastName: customer.lastName || '',
      })
    );
    expect(result?.templateData['customerCreationTime']).toBeDefined();
    expect(result?.templateData['customerCreationDate']).toBeDefined();
    expect(result?.templateData['token']).toBe(undefined);
  });

  it('Verification Token', async () => {
    const customerId = faker.string.uuid();
    const emailToken = faker.string.sample();
    const customer = Customer.random()
      .isEmailVerified(false)
      .build<TCustomer>();

    // Define a mock root to be returned
    const withId = jest.fn().mockReturnValueOnce({
      get: jest.fn().mockReturnValueOnce({
        execute: jest
          .fn()
          .mockReturnValueOnce(Promise.resolve({ body: customer })),
      }),
    });
    const emailTokenPost = jest.fn().mockReturnValue({
      execute: jest.fn().mockReturnValueOnce(
        Promise.resolve({
          body: {
            id: faker.string.uuid(),
            customerId: customerId,
            value: emailToken,
            expiresAt: faker.date.future().toISOString(),
            createdAt: faker.date.past().toISOString(),
          },
        })
      ),
    });
    const customerEmailToken = jest.fn().mockReturnValue({
      post: emailTokenPost,
    });
    const mockRoot = {
      customers: jest.fn().mockReturnValue({
        withId: withId,
        emailToken: customerEmailToken,
      }),
    };

    // Set the mock implementation for createApiRoot to return mockRoot
    (createApiRoot as jest.Mock).mockReturnValue(mockRoot);

    const customerCreatedMessage: CustomerCreatedMessage = {
      createdAt: faker.date.past().toISOString(),
      id: '',
      lastModifiedAt: '',
      resource: { id: customerId, typeId: 'customer' },
      resourceVersion: 0,
      sequenceNumber: 0,
      type: 'CustomerCreated',
      version: 0,
      customer: customer,
    };

    const result = await handleCustomerCreated(customerCreatedMessage, []);
    expect(emailTokenPost).toBeCalledWith({
      body: expect.objectContaining({ id: customer.id }),
    });
    expect(result?.templateData['customerEmailToken']).toEqual(emailToken);
    expect(
      result?.templateData['customerEmailTokenValidityDate']
    ).toBeDefined();
    expect(
      result?.templateData['customerEmailTokenValidityTime']
    ).toBeDefined();
  });
});
