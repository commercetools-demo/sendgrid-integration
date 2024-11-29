import { CustomerCreatedMessage } from '@commercetools/platform-sdk';
import { readAdditionalConfiguration } from '../utils/config.utils';
import { HandlerReturnType } from '../types/index.types';
import { createTokenForVerification } from '../ctp/customer';
import { convertDateToText } from '../utils/date.utils';
import { findLocale } from '../utils/customer.utils';

export const handleCustomerCreated = async (
  messageBody: CustomerCreatedMessage
): Promise<HandlerReturnType> => {
  const { customerRegistrationTemplateId } = readAdditionalConfiguration();

  const customer = messageBody.customer;
  const createdAt = convertDateToText(customer.createdAt, findLocale(customer));
  const customerDetails: HandlerReturnType['templateData'] = {
    customerEmail: customer.email,
    customerNumber: customer.customerNumber || '',
    customerFirstName: customer.firstName || '',
    customerMiddleName: customer.middleName || '',
    customerLastName: customer.lastName || '',
    customerCreationDate: createdAt.date,
    customerCreationTime: createdAt.time,
  };
  if (!customer.isEmailVerified) {
    const generateTokenResult = await createTokenForVerification(customer.id);
    const tokenExpiresAt = convertDateToText(
      generateTokenResult.expiresAt,
      findLocale(customer)
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
  };
};
