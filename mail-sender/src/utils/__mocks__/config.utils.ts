export const readConfiguration = jest.fn(() => ({
  clientId: 'mockedClientId',
  clientSecret: 'mockedClientSecret',
  projectKey: 'mockedProjectKey',
  scope: 'mockedScope',
  region: 'mockedRegion',
}));

export const readAdditionalConfiguration = jest.fn(() => ({
  senderEmailAddress: 'mockedSenderEmailAddress',
  customerRegistrationTemplateId: 'mockedCustomerRegistrationTemplateId',
  orderConfirmationTemplateId: 'mockedOrderConfirmationTemplateId',
  orderStateChangeTemplateId: 'mockedOrderStateChangeTemplateId',
  orderRefundTemplateId: 'mockedOrderRefundTemplateId',
  emailProviderApiKey: 'mockedEmailProviderApiKey',
  customerPasswordTokenCreationTemplateId:
    'mockedCustomerPasswordTokenCreationTemplateId',
  defaultLocale: 'en-GB',
}));
