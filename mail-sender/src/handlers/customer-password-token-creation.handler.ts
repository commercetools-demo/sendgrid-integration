import { CustomerPasswordTokenCreatedMessage } from '@commercetools/platform-sdk';
import { generatePasswordResetToken, getCustomerById } from '../ctp/customer';
import { HandlerReturnType, HandlerType } from '../types/index.types';
import { readAdditionalConfiguration } from '../utils/config.utils';
import CustomError from '../errors/custom.error';
import { mapNames, findLocale, mapEmail } from '../utils/customer.utils';
import { convertDateToText } from '../utils/date.utils';

export const handleCustomerPasswordTokenCreated: HandlerType<
  CustomerPasswordTokenCreatedMessage
> = async (messageBody) => {
  const templateId =
    readAdditionalConfiguration().customerPasswordTokenCreationTemplateId;

  const customerId = messageBody.customerId;
  const customer = await getCustomerById(customerId);
  const generateTokenResult = await generatePasswordResetToken(customer.email);

  if (generateTokenResult) {
    const locale = findLocale(customer);
    const createdAt = convertDateToText(customer.createdAt, locale);

    const tokenExpiresAt = convertDateToText(
      generateTokenResult.expiresAt,
      locale
    );
    const customerDetails: HandlerReturnType['templateData'] = {
      ...mapEmail(customer),
      customerNumber: customer.customerNumber || '',
      ...mapNames(customer),
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
      locale: locale,
    };
  } else {
    throw new CustomError(
      400,
      `Unable to generate token with customer ID ${customerId}`
    );
  }
};
