import CustomError from '../errors/custom.error';
import envValidators from '../validators/env.validators';
import { getValidateMessages } from '../validators/helpers.validators';
import envAdditionalConfigValidators from '../validators/env.additional.validators';

/**
 * Read the configuration env vars
 * (Add yours accordingly)
 *
 * @returns The configuration with the correct env vars
 */
export const readConfiguration = () => {
  const envVars = {
    clientId: process.env.CTP_CLIENT_ID as string,
    clientSecret: process.env.CTP_CLIENT_SECRET as string,
    projectKey: process.env.CTP_PROJECT_KEY as string,
    scope: process.env.CTP_SCOPE,
    region: process.env.CTP_REGION as string,
  };

  const validationErrors = getValidateMessages(envValidators, envVars);

  if (validationErrors.length) {
    throw new CustomError(
      'InvalidEnvironmentVariablesError',
      'Invalid Environment Variables please check your .env file',
      validationErrors
    );
  }

  return envVars;
};

export const readAdditionalConfiguration = () => {
  const envVars = {
    senderEmailAddress: process.env.SENDER_EMAIL_ADDRESS as string,
    customerRegistrationTemplateId: process.env
      .CUSTOMER_REGISTRATION_TEMPLATE_ID as string,
    orderConfirmationTemplateId: process.env
      .ORDER_CONFIRMATION_TEMPLATE_ID as string,
    orderStateChangeTemplateId: process.env
      .ORDER_STATE_CHANGE_TEMPLATE_ID as string,
    orderRefundTemplateId: process.env.ORDER_REFUND_TEMPLATE_ID as string,
    emailProviderApiKey: process.env.EMAIL_PROVIDER_API_KEY as string,
    customerPasswordTokenCreationTemplateId: process.env
      .CUSTOMER_PASSWORD_TOKEN_CREATION_TEMPLATE_ID as string,
    defaultLocale: process.env.DEFAULT_LOCALE as string,
  };

  const validationErrors = getValidateMessages(
    envAdditionalConfigValidators,
    envVars
  );

  if (validationErrors.length) {
    throw new CustomError(
      'InvalidEnvironmentVariablesError',
      'Invalid Environment Variables please check your .env file',
      validationErrors
    );
  }

  return envVars;
};
