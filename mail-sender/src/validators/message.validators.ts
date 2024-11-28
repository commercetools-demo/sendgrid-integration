import CustomError from '../errors/custom.error';
import { Request } from 'express';
import { logger } from '../utils/logger.utils';
import { Message } from '@commercetools/platform-sdk';

export function doValidation(request: Request) {
  // Check request body
  if (!request.body) {
    logger.error('Missing request body.');
    throw new CustomError(400, 'Bad request: No Pub/Sub message was received');
  }

  // Check if the body comes in a message
  if (!request.body.message) {
    logger.error('Missing body message');
    throw new CustomError(400, 'Bad request: Wrong No Pub/Sub message format');
  }

  // Receive the Pub/Sub message
  const pubSubMessage = request.body.message;

  if (!pubSubMessage.data) {
    logger.error('Missing data in body message');
    throw new CustomError(
      400,
      'Bad request: Wrong No Pub/Sub message format - Missing data in body message'
    );
  }

  const decodedData = pubSubMessage.data
    ? Buffer.from(pubSubMessage.data, 'base64').toString().trim()
    : undefined;

  if (!decodedData) {
    logger.error('Missing data in body message');
    throw new CustomError(
      400,
      'Bad request: Wrong No Pub/Sub message format - Missing data in body message'
    );
  }
  const messageBody: Message = JSON.parse(decodedData);

  return messageBody;

  // if (!isValidMessageType(messageBody)) {
  //   throw new CustomError(
  //     400,
  //     `Message type ${messageBody.type} is incorrect.`
  //   );
  // }
  //
  // // Make sure incoming message contains the identifier of the changed resources
  // const resourceTypeId = messageBody?.resource?.typeId;
  // const resourceId = messageBody?.resource?.id;
  //
  // if (
  //   isCustomerSubscriptionMessage(messageBody) &&
  //   (resourceTypeId !== 'customer' || !resourceId)
  // ) {
  //   throw new CustomError(400, ` No customer ID is found in message.`);
  // }
  //
  // if (isOrderSubscriptionMessage(messageBody)) {
  //   if (resourceTypeId !== 'order' || !resourceId) {
  //     throw new CustomError(400, ` No order ID is found in message.`);
  //   }
  //   if (
  //     messageBody.order &&
  //     !messageBody.order?.customerId &&
  //     !messageBody.order?.customerEmail
  //   ) {
  //     throw new CustomError(
  //       202,
  //       `Order (ID=${resourceId}) does not link to any customer contact. Skip handling the message.`
  //     );
  //   }
  // }
  //
  // if (isSelfCreatedChange(messageBody)) {
  //   throw new CustomError(
  //     202,
  //     `Incoming message (ID=${messageBody.id}) is about change of ${messageBody.type} created by the current connector. Skip handling the message.`
  //   );
  // }
  // return messageBody;
}
