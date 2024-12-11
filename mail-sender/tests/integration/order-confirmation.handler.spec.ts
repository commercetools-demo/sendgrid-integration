import { Order, type TOrder } from '@commercetools-test-data/order';
import {
  Order as CTOrder,
  OrderCreatedMessage,
} from '@commercetools/platform-sdk';
import { handleOrderCreatedMessage } from '../../src/handlers/order-confirmation.handler';
import { expect } from '@jest/globals';
import {
  readAdditionalConfiguration,
  readConfiguration,
} from '../../src/utils/config.utils';
import { faker } from '@faker-js/faker';
import { Customer, type TCustomer } from '@commercetools-test-data/customer';
import { createApiRoot } from '../../src/client/create.client';
import { LineItem } from '@commercetools-test-data/cart';
import { Project, type TProject } from '@commercetools-test-data/project';

jest.mock('../../src/client/create.client', () => {
  const mockCreateApiRoot = jest.fn();
  return {
    createApiRoot: mockCreateApiRoot,
  };
});

jest.mock('../../src/utils/config.utils');

describe('Testing Order Confirmation', () => {
  beforeEach(() => {
    (readConfiguration as jest.Mock).mockClear();
    (readAdditionalConfiguration as jest.Mock).mockClear();
  });

  it('Order Created With Customer', async () => {
    const orderId = faker.string.uuid();
    const customerId = faker.string.uuid();
    const project = Project.random().build<TProject>();
    const customer = Customer.random().locale('EN').build<TCustomer>();
    const order = Order.random()
      .customerId(customerId)
      .lineItems([LineItem.random(), LineItem.random()])
      .build<TOrder>();

    // Define a mock root to be returned
    const customersWithId = jest.fn().mockReturnValueOnce({
      get: jest.fn().mockReturnValueOnce({
        execute: jest
          .fn()
          .mockReturnValueOnce(Promise.resolve({ body: customer })),
      }),
    });

    const mockRoot = {
      get: jest.fn().mockReturnValue({
        execute: jest
          .fn()
          .mockReturnValueOnce(Promise.resolve({ body: project })),
      }),
      customers: jest.fn().mockReturnValue({
        withId: customersWithId,
      }),
    };

    // Set the mock implementation for createApiRoot to return mockRoot
    (createApiRoot as jest.Mock).mockReturnValue(mockRoot);

    const orderCreatedMessage: OrderCreatedMessage = {
      createdAt: faker.date.past().toISOString(),
      id: faker.string.uuid(),
      lastModifiedAt: faker.date.past().toISOString(),
      resource: { id: orderId, typeId: 'order' },
      resourceVersion: faker.number.int(),
      sequenceNumber: faker.number.int(),
      type: 'OrderCreated',
      version: faker.number.int(),
      order: order as any as CTOrder,
    };

    const result = await handleOrderCreatedMessage(orderCreatedMessage, []);

    expect(result?.recipientEmailAddresses[0]).not.toBe(undefined);
    expect(result?.templateId).toEqual(
      readAdditionalConfiguration().orderConfirmationTemplateId
    );

    expect(result?.templateData).toEqual(
      expect.objectContaining({
        orderNumber: order.orderNumber,
      })
    );
    expect(result?.templateData['orderLineItems'].length).toEqual(
      order.lineItems.length
    );
  });

  it('Order Created Anonymous', async () => {
    const orderId = faker.string.uuid();
    const order = Order.random()
      .customerEmail(faker.internet.email())
      .customerId(undefined)
      .build<TOrder>();

    const project = Project.random().build<TProject>();

    const mockRoot = {
      get: jest.fn().mockReturnValue({
        execute: jest
          .fn()
          .mockReturnValueOnce(Promise.resolve({ body: project })),
      }),
    };

    // Set the mock implementation for createApiRoot to return mockRoot
    (createApiRoot as jest.Mock).mockReturnValue(mockRoot);

    const orderCreatedMessage: OrderCreatedMessage = {
      createdAt: faker.date.past().toISOString(),
      id: faker.string.uuid(),
      lastModifiedAt: faker.date.past().toISOString(),
      resource: { id: orderId, typeId: 'order' },
      resourceVersion: faker.number.int(),
      sequenceNumber: faker.number.int(),
      type: 'OrderCreated',
      version: faker.number.int(),
      order: order as any as CTOrder,
    };

    const result = await handleOrderCreatedMessage(orderCreatedMessage, []);

    expect(result?.recipientEmailAddresses[0]).not.toBe(undefined);
    expect(result?.templateId).toEqual(
      readAdditionalConfiguration().orderConfirmationTemplateId
    );

    expect(result?.templateData).toEqual(
      expect.objectContaining({
        orderNumber: order.orderNumber,
      })
    );
    expect(result?.templateData['orderLineItems'].length).toEqual(
      order.lineItems.length
    );
  });
});
