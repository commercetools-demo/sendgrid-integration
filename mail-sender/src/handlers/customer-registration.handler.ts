import { CustomerCreatedMessage } from '@commercetools/platform-sdk';
import { readAdditionalConfiguration } from '../utils/config.utils';
import { HandlerReturnType } from '../types/index.types';
import { createTokenForVerification } from '../ctp/customer';
import { convertDateToText } from '../utils/date.utils';
import { mapNames, findLocale, mapEmail } from '../utils/customer.utils';

export const handleCustomerCreated = async (
  messageBody: CustomerCreatedMessage
): Promise<HandlerReturnType> => {
  const { customerRegistrationTemplateId } = readAdditionalConfiguration();

  const customer = messageBody.customer;
  const createdAt = convertDateToText(customer.createdAt, findLocale(customer));
  let customerDetails: HandlerReturnType['templateData'] = {
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
      findLocale(customer)
    );
    customerDetails['customerEmailToken'] = generateTokenResult.value;
    customerDetails['customerEmailTokenValidityDate'] = tokenExpiresAt.date;
    customerDetails['customerEmailTokenValidityTime'] = tokenExpiresAt.time;
  }

  customerDetails = {
    ...customerDetails,
    messages: {
      welcome: 'Hey',
      text: 'Thank you for signing up!',
      verificationText: "Let's verify your account so you can start.",
      verificationButtonText: 'Verify your account',
      verificationValidityText:
        'Your link is active for 48 hours. After that, you will need to resend the verification email.',
      heroMessage: 'Customer Created',
      heroImage:
        'http://cdn.mcauto-images-production.sendgrid.net/fcda5b5400c10505/d9dee00e-a252-4211-9fac-ef09b9d339e8/1200x300.png',
      verificationLink: 'asdf',
    },
  };

  return {
    recipientEmailAddresses: [customerDetails.customerEmail],
    templateId: customerRegistrationTemplateId,
    templateData: customerDetails,
    successMessage: `Confirmation email of customer registration has been sent to ${customerDetails.customerEmail}.`,
    preSuccessMessage: `Ready to send confirmation email of customer registration : customerEmail=${customerDetails.customerEmail}, customerNumber=${customerDetails.customerNumber},  customerCreationTime=${customerDetails.customerCreationTime} `,
  };
};
