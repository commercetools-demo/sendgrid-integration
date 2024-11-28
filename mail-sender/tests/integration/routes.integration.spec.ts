import request from 'supertest';
import app from '../../src/app';
import { expect } from '@jest/globals';
import { Customer, CustomerCreatedMessage } from '@commercetools/platform-sdk';
import { faker } from '@faker-js/faker';

describe('real live test', () => {
  it.skip('customer created', async () => {
    const customerId = 'f52e4230-a1f9-4f49-b6eb-af33fba3ddad';
    const customer: Customer = {
      addresses: [],
      authenticationMode: 'Password',
      createdAt: faker.date.past().toISOString(),
      email: 'philipp.hofmann@commercetools.com',
      id: customerId,
      isEmailVerified: false,
      lastModifiedAt: faker.date.past().toISOString(),
      version: faker.number.int(),
    };
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
    // Call the route handler
    const response = await request(app)
      .post('/mail-sender')
      .send({
        message: {
          data: Buffer.from(JSON.stringify(customerCreatedMessage)).toString(
            'base64'
          ),
        },
      });
    expect(response.status).toBe(204);
  });
});
