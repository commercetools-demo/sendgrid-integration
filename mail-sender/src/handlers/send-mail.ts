import { logger } from '../utils/logger.utils';
import sendGridMail from '@sendgrid/mail';
import { readAdditionalConfiguration } from '../utils/config.utils';
import CustomError from '../errors/custom.error';
import { notEmpty } from '../utils/notemtpy.utils';

export const sendMail = async (
  senderEmailAddress: string,
  recipientEmailAddresses: Array<string | undefined>,
  templateId: string,
  templateData: Record<string, any>
) => {
  try {
    logger.info('sending email with data', templateData);
    const filteredEmails = recipientEmailAddresses.filter(notEmpty);
    if (filteredEmails.length > 0) {
      sendGridMail.setApiKey(readAdditionalConfiguration().emailProviderApiKey);
      const msg: sendGridMail.MailDataRequired = {
        from: senderEmailAddress,
        personalizations: [
          {
            to: filteredEmails,
            dynamicTemplateData: templateData,
          },
        ],
        templateId: templateId,
      };
      await sendGridMail.send(msg);
    }
  } catch (err) {
    logger.error('Fail to communicate with SendGrid.', err);
    throw new CustomError(500, 'Fail to communicate with SendGrid.');
  }
};
