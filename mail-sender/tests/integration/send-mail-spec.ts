import {
  readAdditionalConfiguration,
  readConfiguration,
} from '../../src/utils/config.utils';
import request from 'supertest';
import app from '../../src/app';
import { expect } from '@jest/globals';
import { sendMail } from '../../src/handlers/send-mail';

describe('Testing router', () => {
  beforeEach(() => {
    (readConfiguration as jest.Mock).mockClear();
    (readAdditionalConfiguration as jest.Mock).mockClear();
  });

  test.skip('Post to non existing route', async () => {
    await sendMail(readAdditionalConfiguration().senderEmailAddress, {
      recipientEmailAddresses: ['philipp.hofmann@commercetools.com'],
      templateId: readAdditionalConfiguration().orderConfirmationTemplateId,
      templateData: {},
      successMessage: '',
      preSuccessMessage: '',
    });
  });
});
