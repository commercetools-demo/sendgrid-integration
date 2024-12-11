import { CustomerCreatedMessage } from '@commercetools/platform-sdk';
import { readAdditionalConfiguration } from '../utils/config.utils';
import { HandlerReturnType, HandlerType } from '../types/index.types';
import { createTokenForVerification } from '../ctp/customer';
import { convertDateToText } from '../utils/date.utils';
import { mapNames, findLocale, mapEmail } from '../utils/customer.utils';

export const handleCustomerCreated: HandlerType<
  CustomerCreatedMessage
> = async (messageBody) => {
  const { customerRegistrationTemplateId } = readAdditionalConfiguration();

  const customer = messageBody.customer;
  const locale = findLocale(customer);
  const createdAt = convertDateToText(customer.createdAt, locale);
  const customerDetails: HandlerReturnType['templateData'] = {
    ...mapEmail(customer),
    customerNumber: customer.customerNumber || '',
    ...mapNames(customer),
    customerCreationDate: createdAt.date,
    customerCreationTime: createdAt.time,
  };
  if (!customer.isEmailVerified) {
    const generateTokenResult = await createTokenForVerification(customer.id);
    const tokenExpiresAt = convertDateToText(
      generateTokenResult.expiresAt,
      locale
    );
    customerDetails['customerEmailToken'] = generateTokenResult.value;
    customerDetails['customerEmailTokenValidityDate'] = tokenExpiresAt.date;
    customerDetails['customerEmailTokenValidityTime'] = tokenExpiresAt.time;
  }

  return {
    recipientEmailAddresses: [customerDetails.customerEmail],
    templateId: customerRegistrationTemplateId,
    templateData: customerDetails,
    successMessage: `Confirmation email of customer registration has been sent to ${customerDetails.customerEmail}.`,
    preSuccessMessage: `Ready to send confirmation email of customer registration : customerEmail=${customerDetails.customerEmail}, customerNumber=${customerDetails.customerNumber},  customerCreationTime=${customerDetails.customerCreationTime} `,
    locale: locale,
  };
};
