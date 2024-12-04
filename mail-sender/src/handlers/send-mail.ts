import { logger } from '../utils/logger.utils';
import { HandlerReturnType } from '../types/index.types';
import sendGridMail from '@sendgrid/mail';
import { readAdditionalConfiguration } from '../utils/config.utils';
import CustomError from '../errors/custom.error';
import { notEmpty } from '../utils/notemtpy.utils';

export const sendMail = async (
  senderEmailAddress: string,
  data: HandlerReturnType
) => {
  try {
    const filteredEmails = data.recipientEmailAddresses.filter(notEmpty);
    if (filteredEmails.length > 0) {
      sendGridMail.setApiKey(readAdditionalConfiguration().emailProviderApiKey);
      const msg: sendGridMail.MailDataRequired = {
        from: senderEmailAddress,
        personalizations: [
          {
            to: filteredEmails,
            dynamicTemplateData: data.templateData,
          },
        ],
        templateId: data.templateId,
      };
      await sendGridMail.send(msg);
    }
  } catch (err) {
    logger.error('Fail to communicate with SendGrid.', err);
    throw new CustomError(500, 'Fail to communicate with SendGrid.');
  }
};
