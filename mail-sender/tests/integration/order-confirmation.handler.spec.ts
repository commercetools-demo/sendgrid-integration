import { Order, type TOrder } from '@commercetools-test-data/order';
import {
  OrderCreatedMessage,
  Order as CTOrder,
} from '@commercetools/platform-sdk';
import { handleOrderCreatedMessage } from '../../src/handlers/order-confirmation.handler';
import { expect } from '@jest/globals';
import { readAdditionalConfiguration } from '../../src/utils/config.utils';
import { faker } from '@faker-js/faker';

describe('Testing Order Confirmation', () => {
  it('Order Created', async () => {
    const orderId = '62e10dcc-1c76-4e26-823a-5b3829b8f9f8';
    const customerId = 'f52e4230-a1f9-4f49-b6eb-af33fba3ddad';

    const order = Order.random().customerId(customerId).build<TOrder>();

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

    const result = await handleOrderCreatedMessage(orderCreatedMessage);

    expect(result.recipientEmailAddresses[0]).not.toBe(undefined);
    expect(result.templateId).toEqual(
      readAdditionalConfiguration().orderConfirmationTemplateId
    );

    expect(result.templateData).toEqual(
      expect.objectContaining({
        orderNumber: order.orderNumber,
      })
    );
    expect(result.templateData['orderLineItems'].length).toEqual(
      order.lineItems.length
    );
  });
});
