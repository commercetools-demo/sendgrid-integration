import { OrderStateChangedMessage } from '@commercetools/platform-sdk';
import { expect } from '@jest/globals';
import { readAdditionalConfiguration } from '../../src/utils/config.utils';
import { handleOrderStateChanged } from '../../src/handlers/order-state-change.handler';
import { faker } from '@faker-js/faker';

describe('Testing Order State Changed', () => {
  it('Order State Changed', async () => {
    const orderId = '62e10dcc-1c76-4e26-823a-5b3829b8f9f8';

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

    expect(result.recipientEmailAddresses[0]).not.toBe(undefined);
    expect(result.templateId).toEqual(
      readAdditionalConfiguration().orderStateChangeTemplateId
    );
    expect(result.templateData['orderState']).toBeDefined();
  });
});
