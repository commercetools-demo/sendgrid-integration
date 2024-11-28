import { logger } from '../utils/logger.utils';
import { HandlerReturnType } from '../types/index.types';
import sendGridMail from '@sendgrid/mail';
import { readAdditionalConfiguration } from '../utils/config.utils';
import CustomError from '../errors/custom.error';

export const sendMail = async (
  senderEmailAddress: string,
  data: HandlerReturnType
) => {
  try {
    sendGridMail.setApiKey(readAdditionalConfiguration().emailProviderApiKey);
    const msg: sendGridMail.MailDataRequired = {
      from: senderEmailAddress,
      personalizations: [
        {
          to: [data.recipientEmailAddress],
          dynamicTemplateData: data.templateData,
        },
      ],
      templateId: data.templateId,
    };
    await sendGridMail.send(msg);
  } catch (err) {
    logger.error('Fail to communicate with SendGrid.', err);
    throw new CustomError(500, 'Fail to communicate with SendGrid.');
  }
};
