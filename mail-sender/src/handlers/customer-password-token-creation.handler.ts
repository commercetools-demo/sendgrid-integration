import { CustomerPasswordTokenCreatedMessage } from '@commercetools/platform-sdk';
import { generatePasswordResetToken, getCustomerById } from '../ctp/customer';
import { HandlerReturnType } from '../types/index.types';
import { readAdditionalConfiguration } from '../utils/config.utils';
import CustomError from '../errors/custom.error';
import { findLocale } from '../utils/customer.utils';
import { convertDateToText } from '../utils/date.utils';

export const handleCustomerPasswordTokenCreated = async (
  messageBody: CustomerPasswordTokenCreatedMessage
): Promise<HandlerReturnType> => {
  const templateId =
    readAdditionalConfiguration().customerPasswordTokenCreationTemplateId;

  const customerId = messageBody.customerId;
  const customer = await getCustomerById(customerId);
  const generateTokenResult = await generatePasswordResetToken(customer.email);

  if (generateTokenResult) {
    const createdAt = convertDateToText(
      customer.createdAt,
      findLocale(customer)
    );

    const tokenExpiresAt = convertDateToText(
      generateTokenResult.expiresAt,
      findLocale(customer)
    );
    const customerDetails = {
      customerEmail: customer.email,
      customerNumber: customer.customerNumber || '',
      customerFirstName: customer.firstName || '',
      customerMiddleName: customer.middleName || '',
      customerLastName: customer.lastName || '',
      customerCreationDate: createdAt.date,
      customerCreationTime: createdAt.time,
      customerPasswordToken: generateTokenResult.value,
      customerPasswordTokenValidityDate: tokenExpiresAt.date,
      customerPasswordTokenValidityTime: tokenExpiresAt.time,
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
