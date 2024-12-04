import { OrderStateChangedMessage } from '@commercetools/platform-sdk';
import { expect } from '@jest/globals';
import {
  readAdditionalConfiguration,
  readConfiguration,
} from '../../src/utils/config.utils';
import { handleOrderStateChanged } from '../../src/handlers/order-state-change.handler';
import { faker } from '@faker-js/faker';
import { Customer, type TCustomer } from '@commercetools-test-data/customer';
import { createApiRoot } from '../../src/client/create.client';
import { Order, TOrder } from '@commercetools-test-data/order';

jest.mock('../../src/client/create.client', () => {
  const mockCreateApiRoot = jest.fn();
  return {
    createApiRoot: mockCreateApiRoot,
  };
});

jest.mock('../../src/utils/config.utils');

describe('Testing Order State Changed', () => {
  beforeEach(() => {
    (readConfiguration as jest.Mock).mockClear();
    (readAdditionalConfiguration as jest.Mock).mockClear();
  });

  it('Order State Changed', async () => {
    const orderId = faker.string.uuid();
    const customerId = faker.string.uuid();
    const customer = Customer.random().build<TCustomer>();
    const order = Order.random()
      .customerId(customerId)
      .customerEmail(customer.email)

      .build<TOrder>();

    // Define a mock root to be returned
    const customersWithId = jest.fn().mockReturnValueOnce({
      get: jest.fn().mockReturnValueOnce({
        execute: jest
          .fn()
          .mockReturnValueOnce(Promise.resolve({ body: customer })),
      }),
    });

    const ordersWithId = jest.fn().mockReturnValueOnce({
      get: jest.fn().mockReturnValueOnce({
        execute: jest
          .fn()
          .mockReturnValueOnce(Promise.resolve({ body: order })),
      }),
    });

    const mockRoot = {
      orders: jest.fn().mockReturnValue({
        withId: ordersWithId,
      }),
      customers: jest.fn().mockReturnValue({
        withId: customersWithId,
      }),
    };

    // Set the mock implementation for createApiRoot to return mockRoot
    (createApiRoot as jest.Mock).mockReturnValue(mockRoot);

    const orderStateChangedMessage: OrderStateChangedMessage = {
      createdAt: faker.date.past().toISOString(),
      id: faker.string.uuid(),
      lastModifiedAt: faker.date.past().toISOString(),
      resource: { id: orderId, typeId: 'order' },
      resourceVersion: faker.number.int(),
      sequenceNumber: faker.number.int(),
      type: 'OrderStateChanged',
      version: faker.number.int(),
      oldOrderState: 'Open',
      orderState: 'Complete',
    };

    const result = await handleOrderStateChanged(orderStateChangedMessage);

    expect(result.recipientEmailAddresses[0]).toEqual(customer.email);
    expect(result.templateId).toEqual(
      readAdditionalConfiguration().orderStateChangeTemplateId
    );
    expect(result.templateData['orderState']).toBeDefined();
    console.log(JSON.stringify(result?.templateData, undefined, 2));
  });
});
