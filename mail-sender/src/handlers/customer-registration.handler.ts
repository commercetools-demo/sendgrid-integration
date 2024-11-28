import { CustomerCreatedMessage } from '@commercetools/platform-sdk';
import { readAdditionalConfiguration } from '../utils/config.utils';
import { HandlerReturnType } from '../types/index.types';
import { createTokenForVerification } from '../ctp/customer';

export const handleCustomerCreated = async (
  messageBody: CustomerCreatedMessage
): Promise<HandlerReturnType> => {
  const { customerRegistrationTemplateId } = readAdditionalConfiguration();

  const customer = messageBody.customer;
  const customerDetails: HandlerReturnType['templateData'] = {
    customerEmail: customer.email,
    customerNumber: customer.customerNumber || '',
    customerFirstName: customer.firstName || '',
    customerMiddleName: customer.middleName || '',
    customerLastName: customer.lastName || '',
    customerCreationTime: customer.createdAt,
  };
  if (!customer.isEmailVerified) {
    customerDetails['token'] = await createTokenForVerification(customer.id);
  }

  return {
    recipientEmailAddresses: [customerDetails.customerEmail],
    templateId: customerRegistrationTemplateId,
    templateData: customerDetails,
    successMessage: `Confirmation email of customer registration has been sent to ${customerDetails.customerEmail}.`,
    preSuccessMessage: `Ready to send confirmation email of customer registration : customerEmail=${customerDetails.customerEmail}, customerNumber=${customerDetails.customerNumber},  customerCreationTime=${customerDetails.customerCreationTime} `,
  };
};
