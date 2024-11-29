import { Customer, type TCustomer } from '@commercetools-test-data/customer';
import { faker } from '@faker-js/faker';

import { handleCustomerCreated } from '../../src/handlers/customer-registration.handler';
import { expect } from '@jest/globals';
import { readAdditionalConfiguration } from '../../src/utils/config.utils';
import { CustomerCreatedMessage } from '@commercetools/platform-sdk';

describe('Testing Customer Registration', () => {
  it('Customer Created', async () => {
    const customerId = 'f52e4230-a1f9-4f49-b6eb-af33fba3ddad';

    const customer = Customer.random().isEmailVerified(true).build<TCustomer>();
    const customerCreatedMessage: CustomerCreatedMessage = {
      createdAt: faker.date.past().toISOString(),
      id: faker.string.uuid(),
      lastModifiedAt: faker.date.past().toISOString(),
      resource: { id: customerId, typeId: 'customer' },
      resourceVersion: faker.number.int(),
      sequenceNumber: faker.number.int(),
      type: 'CustomerCreated',
      version: faker.number.int(),
      customer: customer,
    };

    const result = await handleCustomerCreated(customerCreatedMessage);
    expect(result.recipientEmailAddresses[0]).toEqual(customer.email);
    expect(result.templateId).toEqual(
      readAdditionalConfiguration().customerRegistrationTemplateId
    );
    expect(result.templateData).toEqual(
      expect.objectContaining({
        customerEmail: customer.email,
        customerNumber: customer.customerNumber || '',
        customerFirstName: customer.firstName || '',
        customerMiddleName: customer.middleName || '',
        customerLastName: customer.lastName || '',
      })
    );
    expect(result.templateData['customerCreationTime']).toBeDefined();
    expect(result.templateData['customerCreationDate']).toBeDefined();
    expect(result.templateData['token']).toBe(undefined);
  });

  it('Verification Token', async () => {
    const customerId = 'f52e4230-a1f9-4f49-b6eb-af33fba3ddad';

    const customer = Customer.random()
      .id(customerId)
      .isEmailVerified(false)
      .build<TCustomer>();
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

    const result = await handleCustomerCreated(customerCreatedMessage);
    expect(result.templateData['token']).not.toBe(undefined);
  });
});
