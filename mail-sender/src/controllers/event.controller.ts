import { Request, Response } from 'express';
import { logger } from '../utils/logger.utils';
import { doValidation } from '../validators/message.validators';
import { handleOrderStateChanged } from '../handlers/order-state-change.handler';
import { handleOrderCreatedMessage } from '../handlers/order-confirmation.handler';
import { handleReturnInfo } from '../handlers/order-refund.handler';
import { handleCustomerCreated } from '../handlers/customer-registration.handler';
import { sendMail } from '../handlers/send-mail';
import { readAdditionalConfiguration } from '../utils/config.utils';
import { handleCustomerPasswordTokenCreated } from '../handlers/customer-password-token-creation.handler';

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
  let emailData = undefined;
  try {
    switch (messageBody.type) {
      case 'CustomerCreated': {
        emailData = await handleCustomerCreated(messageBody);
        break;
      }
      case 'OrderCreated': {
        emailData = await handleOrderCreatedMessage(messageBody);
        break;
      }
      case 'OrderStateChanged':
      case 'OrderShipmentStateChanged': {
        emailData = await handleOrderStateChanged(messageBody);
        break;
      }
      case 'ReturnInfoAdded':
      case 'ReturnInfoSet': {
        emailData = await handleReturnInfo(messageBody);
        break;
      }
      case 'CustomerPasswordTokenCreated': {
        emailData = await handleCustomerPasswordTokenCreated(messageBody);
        break;
      }
    }
    if (emailData) {
      const { senderEmailAddress } = readAdditionalConfiguration();
      logger.info(emailData.preSuccessMessage);
      await sendMail(senderEmailAddress, emailData);
      logger.info(emailData.successMessage);
    }
    response.status(204).send();
  } catch (error) {
    logger.error(error);
    response.status(400).send();
  }
};
