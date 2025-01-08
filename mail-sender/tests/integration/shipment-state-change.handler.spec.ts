import { OrderShipmentStateChangedMessage } from '@commercetools/platform-sdk';
import { expect } from '@jest/globals';
import {
  readAdditionalConfiguration,
  readConfiguration,
} from '../../src/utils/config.utils';
import { faker } from '@faker-js/faker';
import { Customer, type TCustomer } from '@commercetools-test-data/customer';
import { createApiRoot } from '../../src/client/create.client';
import { Order, TOrder } from '@commercetools-test-data/order';
import { Project, type TProject } from '@commercetools-test-data/project';
import { handleShipmentStateChanged } from '../../src/handlers/shipment-state-change.handler';

jest.mock('../../src/client/create.client', () => {
  const mockCreateApiRoot = jest.fn();
  return {
    createApiRoot: mockCreateApiRoot,
  };
});

jest.mock('../../src/utils/config.utils');

describe('Testing Shipment State Changed', () => {
  const orderId = faker.string.uuid();
  const customerId = faker.string.uuid();
  const customer = Customer.random().build<TCustomer>();
  const project = Project.random().build<TProject>();
  const order = Order.random()
    .customerId(customerId)
    .customerEmail(customer.email)
    .shipmentState('Shipped')
    .build<TOrder>();
  beforeEach(() => {
    (readConfiguration as jest.Mock).mockClear();
    (readAdditionalConfiguration as jest.Mock).mockClear();
  });

  it('Order Shipment State Changed', async () => {
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
      get: jest.fn().mockReturnValue({
        execute: jest
          .fn()
          .mockReturnValueOnce(Promise.resolve({ body: project })),
      }),
      orders: jest.fn().mockReturnValue({
        withId: ordersWithId,
      }),
      customers: jest.fn().mockReturnValue({
        withId: customersWithId,
      }),
    };

    // Set the mock implementation for createApiRoot to return mockRoot
    (createApiRoot as jest.Mock).mockReturnValue(mockRoot);

    const shipmentStateChangedMessage: OrderShipmentStateChangedMessage = {
      createdAt: faker.date.past().toISOString(),
      id: faker.string.uuid(),
      lastModifiedAt: faker.date.past().toISOString(),
      resource: { id: orderId, typeId: 'order' },
      resourceVersion: faker.number.int(),
      sequenceNumber: faker.number.int(),
      type: 'OrderShipmentStateChanged',
      version: faker.number.int(),
      oldShipmentState: 'Open',
      shipmentState: order.shipmentState!,
    };

    const result = await handleShipmentStateChanged(
      shipmentStateChangedMessage,
      []
    );

    expect(result?.recipientEmailAddresses[0]).toEqual(customer.email);
    expect(result?.templateId).toEqual(
      readAdditionalConfiguration().orderStateChangeTemplateId
    );

    expect(result?.templateData['shipmentState']).toEqual(order.shipmentState);
    expect(result?.templateData['oldShipmentState']).toEqual(
      shipmentStateChangedMessage.oldShipmentState
    );
  });

  it('Order Shipment State Changed (empty old state)', async () => {
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
      get: jest.fn().mockReturnValue({
        execute: jest
          .fn()
          .mockReturnValueOnce(Promise.resolve({ body: project })),
      }),
      orders: jest.fn().mockReturnValue({
        withId: ordersWithId,
      }),
      customers: jest.fn().mockReturnValue({
        withId: customersWithId,
      }),
    };

    // Set the mock implementation for createApiRoot to return mockRoot
    (createApiRoot as jest.Mock).mockReturnValue(mockRoot);

    const shipmentStateChangedMessage: OrderShipmentStateChangedMessage = {
      createdAt: faker.date.past().toISOString(),
      id: faker.string.uuid(),
      lastModifiedAt: faker.date.past().toISOString(),
      resource: { id: orderId, typeId: 'order' },
      resourceVersion: faker.number.int(),
      sequenceNumber: faker.number.int(),
      type: 'OrderShipmentStateChanged',
      version: faker.number.int(),
      shipmentState: order.shipmentState!,
    };

    const result = await handleShipmentStateChanged(
      shipmentStateChangedMessage,
      []
    );

    expect(result?.recipientEmailAddresses[0]).toEqual(customer.email);
    expect(result?.templateId).toEqual(
      readAdditionalConfiguration().orderStateChangeTemplateId
    );

    expect(result?.templateData['shipmentState']).toEqual(order.shipmentState);
    expect(result?.templateData['oldShipmentState']).toEqual('');
  });
});
