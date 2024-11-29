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
    const response = await request(app).post('/mail-sender').send({
      message: 'hello world',
    });
    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      message:
        'Bad request: Wrong No Pub/Sub message format - Missing data in body message',
    });
  });
  test('Post empty body', async () => {
    const response = await request(app).post('/mail-sender');
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
    const response = await request(app).post('/mail-sender');
    expect(response.status).toBe(500);
    expect(response.body).toEqual({ message: 'Internal server error' });
  });
});
