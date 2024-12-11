import { Order, type TOrder } from '@commercetools-test-data/order';
import {
  Order as CTOrder,
  OrderCreatedMessage,
} from '@commercetools/platform-sdk';
import { handleOrderCreatedMessage } from '../../src/handlers/order-confirmation.handler';
import { expect } from '@jest/globals';
import {
  readAdditionalConfiguration,
  readConfiguration,
} from '../../src/utils/config.utils';
import { faker } from '@faker-js/faker';
import { Customer, type TCustomer } from '@commercetools-test-data/customer';
import { createApiRoot } from '../../src/client/create.client';
import { LineItem } from '@commercetools-test-data/cart';
import { Project, type TProject } from '@commercetools-test-data/project';
import { loadAdditionalLocalizations } from '../../src/utils/localization.utils';

jest.mock('../../src/client/create.client', () => {
  const mockCreateApiRoot = jest.fn();
  return {
    createApiRoot: mockCreateApiRoot,
  };
});

jest.mock('../../src/utils/config.utils');

describe('Testing Localizations with Fallback', () => {
  beforeEach(() => {
    (readConfiguration as jest.Mock).mockClear();
    (readAdditionalConfiguration as jest.Mock).mockClear();
  });

  it('Standard', async () => {
    const project = Project.random().build<TProject>();
    const mockRoot = {
      get: jest.fn().mockReturnValue({
        execute: jest
          .fn()
          .mockReturnValueOnce(Promise.resolve({ body: project })),
      }),
    };

    // Set the mock implementation for createApiRoot to return mockRoot
    (createApiRoot as jest.Mock).mockReturnValue(mockRoot);

    const result = await loadAdditionalLocalizations(
      'CustomerCreated',
      'de-DE',
      project.languages,
      false
    );
    expect(result).toBeDefined();
  });
});
