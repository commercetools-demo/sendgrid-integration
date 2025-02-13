import { Request, Response } from 'express';
import { logger } from '../utils/logger.utils';
import {
  doValidation,
  isSelfCreatedChange,
} from '../validators/message.validators';
import { handleOrderStateChanged } from '../handlers/order-state-change.handler';
import { handleOrderStateTransitioned } from '../handlers/order-state-transitioned.handler';
import { handleOrderCreatedMessage } from '../handlers/order-confirmation.handler';
import { handleReturnInfo } from '../handlers/order-refund.handler';
import { handleCustomerCreated } from '../handlers/customer-registration.handler';
import { sendMail } from '../handlers/send-mail';
import { readAdditionalConfiguration } from '../utils/config.utils';
import { handleCustomerPasswordTokenCreated } from '../handlers/customer-password-token-creation.handler';
import { loadAdditionalLocalizations } from '../utils/localization.utils';
import { getProject } from '../ctp/project';
import { handleShipmentStateChanged } from '../handlers/shipment-state-change.handler';
import CustomError from '../errors/custom.error';

/**
 * Exposed event POST endpoint.
 * Receives the Pub/Sub message and works with it
 *
 * @param {Request} request The express request
 * @param {Response} response The express response
 * @returns
 */
export const post = async (request: Request, response: Response) => {
  // Check request body
  const messageBody = doValidation(request);
  //the connector itself creates customer tokens and should not send an email again
  if (isSelfCreatedChange(messageBody)) {
    logger.info(
      `Incoming message (ID=${messageBody.id}) is about change of ${messageBody.type} created by the current connector. Skip handling the message.`
    );
    response.status(204).send();
  }

  let emailData = undefined;
  try {
    const { languages } = await getProject();
    switch (messageBody.type) {
      case 'CustomerCreated': {
        emailData = await handleCustomerCreated(messageBody, languages);
        break;
      }
      case 'OrderImported':
      case 'OrderCreated': {
        emailData = await handleOrderCreatedMessage(messageBody, languages);
        break;
      }
      case 'OrderStateChanged': {
        emailData = await handleOrderStateChanged(messageBody, languages);
        break;
      }
      case 'OrderShipmentStateChanged': {
        emailData = await handleShipmentStateChanged(messageBody, languages);
        break;
      }
      case 'OrderStateTransition': {
        emailData = await handleOrderStateTransitioned(messageBody, languages);
        break;
      }
      case 'ReturnInfoAdded':
      case 'ReturnInfoSet': {
        emailData = await handleReturnInfo(messageBody, languages);
        break;
      }
      case 'CustomerPasswordTokenCreated': {
        emailData = await handleCustomerPasswordTokenCreated(
          messageBody,
          languages
        );
        break;
      }
    }
    if (emailData) {
      const { senderEmailAddress } = readAdditionalConfiguration();
      const result = await loadAdditionalLocalizations(
        messageBody.type,
        emailData.locale,
        languages,
        true
      );
      logger.info(emailData.preSuccessMessage);
      await sendMail(
        senderEmailAddress,
        emailData.recipientEmailAddresses,
        emailData.templateId,
        { ...(result ? { messages: result } : {}), ...emailData.templateData }
      );
      logger.info(emailData.successMessage);
    }
    response.status(204).send();
  } catch (error) {
    logger.error(error);
    response.status(400).send();
  }
};
