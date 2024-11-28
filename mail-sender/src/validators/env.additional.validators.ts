import {
  standardString,
  standardKey,
  standardEmail,
} from './helpers.validators';

/**
 * Create here your own validators
 */
const envAdditionalConfigValidators = [
  standardEmail(['senderEmailAddress'], {
    code: 'InvalidSenderEmailAddress',
    message: 'senderEmailAddress is required and needs to be an email.',
    referencedBy: 'environmentVariables',
  }),

  standardString(
    ['customerRegistrationTemplateId'],
    {
      code: 'InvalidCustomerRegistrationTemplateId',
      message: 'customerRegistrationTemplateId needs to be defined.',
      referencedBy: 'environmentVariables',
    },
    { min: 2, max: undefined }
  ),

  standardString(
    ['orderConfirmationTemplateId'],
    {
      code: 'InvalidOrderConfirmationTemplateId',
      message: 'orderConfirmationTemplateId needs to be defined.',
      referencedBy: 'environmentVariables',
    },
    { min: 2, max: undefined }
  ),

  standardString(
    ['orderStateChangeTemplateId'],
    {
      code: 'InvalidOrderStateChangeTemplateId',
      message: 'orderStateChangeTemplateId needs to be defined.',
      referencedBy: 'environmentVariables',
    },
    { min: 2, max: undefined }
  ),

  standardString(
    ['orderRefundTemplateId'],
    {
      code: 'InvalidOrderRefundTemplateId',
      message: 'orderRefundTemplateId needs to be defined.',
      referencedBy: 'environmentVariables',
    },
    { min: 2, max: undefined }
  ),

  standardString(
    ['emailProviderApiKey'],
    {
      code: 'InvalidEmailProviderApiKey',
      message: 'emailProviderApiKey should be a valid string.',
      referencedBy: 'environmentVariables',
    },
    { min: 2, max: undefined }
  ),
];

export default envAdditionalConfigValidators;
