import { ReturnInfoAddedMessage } from '@commercetools/platform-sdk';
import { expect } from '@jest/globals';
import {
  readAdditionalConfiguration,
  readConfiguration,
} from '../../src/utils/config.utils';
import { handleReturnInfo } from '../../src/handlers/order-refund.handler';
import {
  LineItemReturnItem,
  Order,
  ReturnInfo,
  type TOrder,
} from '@commercetools-test-data/order';
import { LineItem } from '@commercetools-test-data/cart';
import { faker } from '@faker-js/faker';
import { Customer, type TCustomer } from '@commercetools-test-data/customer';
import { createApiRoot } from '../../src/client/create.client';

jest.mock('../../src/client/create.client', () => {
  const mockCreateApiRoot = jest.fn();
  return {
    createApiRoot: mockCreateApiRoot,
  };
});

jest.mock('../../src/utils/config.utils');

describe('Testing Order Refund', () => {
  beforeEach(() => {
    (readConfiguration as jest.Mock).mockClear();
    (readAdditionalConfiguration as jest.Mock).mockClear();
  });

  it('Order Refund', async () => {
    const orderId = faker.string.uuid();
    const lineItemId = faker.string.uuid();

    const customerId = faker.string.uuid();
    const customer = Customer.random().build<TCustomer>();
    const order = Order.random()
      .customerId(customerId)
      .lineItems([LineItem.random().id(lineItemId)])
      .customerEmail(customer.email)
      .returnInfo([
        ReturnInfo.random().items([
          LineItemReturnItem.random().lineItemId(lineItemId),
        ]),
      ])
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

    if (!order.returnInfo) {
      return;
    }

    const returnInfoAddedMessage: ReturnInfoAddedMessage = {
      returnInfo: order.returnInfo[0],
      createdAt: faker.date.past().toISOString(),
      id: faker.string.uuid(),
      lastModifiedAt: faker.date.past().toISOString(),
      resource: { id: orderId, typeId: 'order' },
      resourceVersion: faker.number.int(),
      sequenceNumber: faker.number.int(),
      type: 'ReturnInfoAdded',
      version: faker.number.int(),
    };

    const result = await handleReturnInfo(returnInfoAddedMessage);

    expect(result?.recipientEmailAddresses[0]).toEqual(order.customerEmail);
    expect(result?.templateId).toEqual(
      readAdditionalConfiguration().orderRefundTemplateId
    );

    expect(result?.templateData['orderNumber']).toEqual(order.orderNumber);
    expect(result?.templateData['customerEmail']).toBeDefined();
    expect(result?.templateData['customerFirstName']).toEqual(
      customer.firstName
    );
    expect(result?.templateData['customerMiddleName']).toEqual(
      customer.middleName
    );
    expect(result?.templateData['customerLastName']).toEqual(customer.lastName);
    expect(result?.templateData['orderCreationTime']).toBeDefined();
    expect(result?.templateData['orderCreationDate']).toBeDefined();
    expect(result?.templateData['orderState']).toEqual(order.orderState);
    expect(result?.templateData['orderShipmentState']).toEqual(
      order.shipmentState
    );
    expect(result?.templateData['orderTotalPrice']).toBeDefined();
    expect(result?.templateData['orderTaxedPrice']).toBeDefined();
    expect(result?.templateData['orderLineItems'].length).toEqual(
      returnInfoAddedMessage.returnInfo.items.length
    );
  });
});
