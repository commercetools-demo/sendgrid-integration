import { expect } from '@jest/globals';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import request from 'supertest';
import app from '../../src/app';
import * as enventController from '../../src/controllers/event.controller';
import {
  readAdditionalConfiguration,
  readConfiguration,
} from '../../src/utils/config.utils';
import { OrderCreatedMessage } from '@commercetools/platform-sdk';
import { faker } from '@faker-js/faker';
import { Order as CTOrder } from '@commercetools/platform-sdk/dist/declarations/src/generated/models/order';
import { getOrderById } from '../../src/ctp/order';

jest.mock('../../src/utils/config.utils');
describe('Testing router', () => {
  beforeEach(() => {
    (readConfiguration as jest.Mock).mockClear();
    (readAdditionalConfiguration as jest.Mock).mockClear();
  });
  test('Post to non existing route', async () => {
    const response = await request(app).post('/none');
    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      message: 'Path not found.',
    });
  });
  test('Post invalid body', async () => {
    const response = await request(app).post('/mailSender').send({
      message: 'hello world',
    });
    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      message:
        'Bad request: Wrong No Pub/Sub message format - Missing data in body message',
    });
  });
  test('Post empty body', async () => {
    const response = await request(app).post('/mailSender');
    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      message: 'Bad request: Wrong No Pub/Sub message format',
    });
  });
});
describe('unexpected error', () => {
  let postMock: jest.SpyInstance;

  beforeEach(() => {
    // Mock the post method to throw an error
    postMock = jest.spyOn(enventController, 'post').mockImplementation(() => {
      throw new Error('Test error');
    });
    (readConfiguration as jest.Mock).mockClear();
    (readAdditionalConfiguration as jest.Mock).mockClear();
  });

  afterEach(() => {
    // Restore the original implementation
    postMock.mockRestore();
  });
  test('should handle errors thrown by post method', async () => {
    // Call the route handler
    const response = await request(app).post('/mailSender');
    expect(response.status).toBe(500);
    expect(response.body).toEqual({ message: 'Internal server error' });
  });
});

describe('debugging', () => {
  test.skip('should handle errors thrown by post method', async () => {
    const order = await getOrderById('8326511d-9510-4377-9777-30eb006f8235');
    const orderCreatedMessage: OrderCreatedMessage = {
      createdAt: faker.date.past().toISOString(),
      id: faker.string.uuid(),
      lastModifiedAt: faker.date.past().toISOString(),
      resource: { id: order.id, typeId: 'order' },
      resourceVersion: faker.number.int(),
      sequenceNumber: faker.number.int(),
      type: 'OrderCreated',
      version: faker.number.int(),
      order: order as any as CTOrder,
    };
    // Call the route handler
    const response = await request(app)
      .post('/mailSender')
      .send({
        message: {
          data: Buffer.from(JSON.stringify(orderCreatedMessage)).toString(
            'base64'
          ),
        },
      });
    expect(response.status).toBe(500);
    expect(response.body).toEqual({ message: 'Internal server error' });
  });
});
