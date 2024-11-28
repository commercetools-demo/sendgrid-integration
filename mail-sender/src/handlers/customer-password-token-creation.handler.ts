import { CustomerPasswordTokenCreatedMessage } from '@commercetools/platform-sdk';
import { generatePasswordResetToken, getCustomerById } from '../ctp/customer';
import { HandlerReturnType } from '../types/index.types';
import { readAdditionalConfiguration } from '../utils/config.utils';
import CustomError from '../errors/custom.error';

const DEFAULT_LOCALE = 'US';

export const handleCustomerPasswordTokenCreated = async (
  messageBody: CustomerPasswordTokenCreatedMessage
): Promise<HandlerReturnType> => {
  const templateId =
    readAdditionalConfiguration().customerPasswordTokenCreationTemplateId;

  const customerId = messageBody.customerId;
  const customer = await getCustomerById(customerId);
  const generateTokenResult = await generatePasswordResetToken(customer.email);
  const date = new Date(generateTokenResult.expiresAt);

  if (generateTokenResult) {
    const customerDetails = {
      customerEmail: customer.email,
      customerNumber: customer.customerNumber ? customer.customerNumber : '',
      customerFirstName: customer.firstName ? customer.firstName : '',
      customerMiddleName: customer.middleName ? customer.middleName : '',
      customerLastName: customer.lastName ? customer.lastName : '',
      customerCreationTime: customer.createdAt,
      customerPasswordToken: generateTokenResult.value,
      customerPasswordTokenValidityDate: date.toLocaleDateString(
        customer.locale || DEFAULT_LOCALE
      ),
      customerPasswordTokenValidityTime: date.toLocaleTimeString(
        customer.locale || DEFAULT_LOCALE
      ),
    };

    return {
      recipientEmailAddresses: [customerDetails.customerEmail],
      templateId: templateId,
      templateData: customerDetails,
      successMessage: `Password reset email has been sent to ${customerDetails.customerEmail}.`,
      preSuccessMessage: `Ready to send password reset email : customerEmail=${customerDetails.customerEmail}, customerNumber=${customerDetails.customerNumber}, customerCreationTime=${customerDetails.customerCreationTime} `,
    };
  } else {
    throw new CustomError(
      400,
      `Unable to generate token with customer ID ${customerId}`
    );
  }
};
