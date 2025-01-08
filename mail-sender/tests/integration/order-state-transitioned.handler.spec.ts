import { OrderStateTransitionMessage } from '@commercetools/platform-sdk';
import { expect } from '@jest/globals';
import {
  readAdditionalConfiguration,
  readConfiguration,
} from '../../src/utils/config.utils';
import { faker } from '@faker-js/faker';
import { Customer, type TCustomer } from '@commercetools-test-data/customer';
import { State, type TState } from '@commercetools-test-data/state';
import { createApiRoot } from '../../src/client/create.client';
import { Order, TOrder } from '@commercetools-test-data/order';
import { Project, type TProject } from '@commercetools-test-data/project';
import { handleOrderStateTransitioned } from '../../src/handlers/order-state-transitioned.handler';

jest.mock('../../src/client/create.client', () => {
  const mockCreateApiRoot = jest.fn();
  return {
    createApiRoot: mockCreateApiRoot,
  };
});

jest.mock('../../src/utils/config.utils');

describe('Testing Order State Changed', () => {
  const orderId = faker.string.uuid();
  const customerId = faker.string.uuid();
  const customer = Customer.random().build<TCustomer>();
  const state = State.random().build<TState>();
  const project = Project.random().build<TProject>();
  const order = Order.random()
    .customerId(customerId)
    .customerEmail(customer.email)
    .build<TOrder>();

  beforeEach(() => {
    (readConfiguration as jest.Mock).mockClear();
    (readAdditionalConfiguration as jest.Mock).mockClear();
  });

  it('Order State Transition', async () => {
    // Define a mock root to be returned
    const customersWithId = jest.fn().mockReturnValueOnce({
      get: jest.fn().mockReturnValueOnce({
        execute: jest
          .fn()
          .mockReturnValueOnce(Promise.resolve({ body: customer })),
      }),
    });

    const stateWithId = jest.fn().mockReturnValue({
      get: jest.fn().mockReturnValue({
        execute: jest.fn().mockReturnValue(Promise.resolve({ body: state })),
      }),
    });

    const ordersWithId = jest.fn().mockReturnValueOnce({
      get: jest.fn().mockReturnValueOnce({
        execute: jest.fn().mockReturnValueOnce(
          Promise.resolve({
            body: order,
          })
        ),
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
      states: jest.fn().mockReturnValue({
        withId: stateWithId,
      }),
    };

    // Set the mock implementation for createApiRoot to return mockRoot
    (createApiRoot as jest.Mock).mockReturnValue(mockRoot);

    const orderStateChangedMessage: OrderStateTransitionMessage = {
      createdAt: faker.date.past().toISOString(),
      id: faker.string.uuid(),
      lastModifiedAt: faker.date.past().toISOString(),
      resource: { id: orderId, typeId: 'order' },
      resourceVersion: faker.number.int(),
      sequenceNumber: faker.number.int(),
      type: 'OrderStateTransition',
      version: faker.number.int(),
      state: { typeId: 'state', id: state.id },
      oldState: { typeId: 'state', id: state.id },
      force: false,
    };

    const result = await handleOrderStateTransitioned(
      orderStateChangedMessage,
      ['de']
    );

    expect(result?.recipientEmailAddresses[0]).toEqual(customer.email);
    expect(result?.templateId).toEqual(
      readAdditionalConfiguration().orderStateChangeTemplateId
    );
    expect(result?.templateData['orderState']).toEqual(state?.name?.['de']);
    expect(result?.templateData['oldOrderState']).toEqual(state?.name?.['de']);
  });
});
