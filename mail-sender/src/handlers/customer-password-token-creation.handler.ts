import { CustomerPasswordTokenCreatedMessage } from '@commercetools/platform-sdk';
import { generatePasswordResetToken, getCustomerById } from '../ctp/customer';
import { HandlerReturnType } from '../types/index.types';
import { readAdditionalConfiguration } from '../utils/config.utils';
import CustomError from '../errors/custom.error';
import { mapNames, findLocale, mapEmail } from '../utils/customer.utils';
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
    let customerDetails: HandlerReturnType['templateData'] = {
      ...mapEmail(customer),
      customerNumber: customer.customerNumber || '',
      ...mapNames(customer),
      customerCreationDate: createdAt.date,
      customerCreationTime: createdAt.time,
      customerPasswordToken: generateTokenResult.value,
      customerPasswordTokenValidityDate: tokenExpiresAt.date,
      customerPasswordTokenValidityTime: tokenExpiresAt.time,
    };

    customerDetails = {
      ...customerDetails,
      messages: {
        welcome: 'Hey',
        text: 'Thank you for signing up!',
        verificationText: "Let's update your password so you can start.",
        verificationButtonText: 'Verify your account',
        verificationValidityText:
          'Your link is active for 48 hours. After that, you will need to resend the verification email.',
        verificationLink: 'asdf',
        heroMessage: 'Password Reset',
        heroImage:
          'http://cdn.mcauto-images-production.sendgrid.net/fcda5b5400c10505/d9dee00e-a252-4211-9fac-ef09b9d339e8/1200x300.png',
      },
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
