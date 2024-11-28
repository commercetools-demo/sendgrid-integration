import { ReturnInfoAddedMessage } from '@commercetools/platform-sdk';
import { expect } from '@jest/globals';
import { readAdditionalConfiguration } from '../../src/utils/config.utils';
import { handleReturnInfo } from '../../src/handlers/order-refund.handler';
import { ReturnInfo } from '@commercetools-test-data/order';
import { faker } from '@faker-js/faker';

describe('Testing Order Refund', () => {
  it('Order Refund', async () => {
    const orderId = '62e10dcc-1c76-4e26-823a-5b3829b8f9f8';

    const returnInfo = ReturnInfo.random().build();

    const orderStateChangedMessage: ReturnInfoAddedMessage = {
      returnInfo: returnInfo,
      createdAt: faker.date.past().toISOString(),
      id: faker.string.uuid(),
      lastModifiedAt: faker.date.past().toISOString(),
      resource: { id: orderId, typeId: 'order' },
      resourceVersion: faker.number.int(),
      sequenceNumber: faker.number.int(),
      type: 'ReturnInfoAdded',
      version: faker.number.int(),
    };

    const result = await handleReturnInfo(orderStateChangedMessage);

    expect(result.recipientEmailAddresses[0]).not.toBe(undefined);
    expect(result.templateId).toEqual(
      readAdditionalConfiguration().orderRefundTemplateId
    );
    expect(result.templateData['orderState']).toBeDefined();
  });
});
