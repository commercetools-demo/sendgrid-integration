import { expect } from '@jest/globals';
import {
  readAdditionalConfiguration,
  readConfiguration,
} from '../../src/utils/config.utils';
import { createApiRoot } from '../../src/client/create.client';
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
  const project = Project.random().build<TProject>();
  const mockRoot = {
    get: jest.fn().mockReturnValue({
      execute: jest.fn().mockReturnValue(Promise.resolve({ body: project })),
    }),
  };
  beforeEach(() => {
    (readConfiguration as jest.Mock).mockClear();
    (readAdditionalConfiguration as jest.Mock).mockClear(); // Set the mock implementation for createApiRoot to return mockRoot
    (createApiRoot as jest.Mock).mockReturnValue(mockRoot);
  });

  it('CustomerCreated', async () => {
    const result = await loadAdditionalLocalizations(
      'CustomerCreated',
      'de-DE',
      project.languages,
      false
    );
    expect(result).toBeDefined();
    if (result) {
      expect(Object.keys(result).length).toEqual(8);
    }
  });

  it('All', async () => {
    const array = [
      'CustomerCreated',
      'OrderImported',
      'OrderCreated',
      'OrderStateChanged',
      'OrderShipmentStateChanged',
      'OrderStateTransition',
      'ReturnInfoAdded',
      'ReturnInfoSet',
      'CustomerPasswordTokenCreated',
    ];
    for (const item of array) {
      const result = await loadAdditionalLocalizations(
        item,
        'de-DE',
        project.languages,
        false
      );
      expect(result).toBeDefined();
    }
  });
});
