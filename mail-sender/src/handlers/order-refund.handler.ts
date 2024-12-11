import CustomError from '../errors/custom.error';
import { HTTP_STATUS_BAD_REQUEST } from '../constants/http-status.constants';
import {
  ReturnInfoAddedMessage,
  ReturnInfoSetMessage,
  ReturnInfo,
} from '@commercetools/platform-sdk';
import { readAdditionalConfiguration } from '../utils/config.utils';
import { getOrderById } from '../ctp/order';
import { HandlerReturnType, HandlerType } from '../types/index.types';
import { findLocale } from '../utils/customer.utils';
import { logger } from '../utils/logger.utils';
import { getCustomerFromOrder, mapOrderDefaults } from '../utils/order.utils';
import { mapLineItem } from '../utils/lineitem.utils';

export const handleReturnInfo: HandlerType<
  ReturnInfoAddedMessage | ReturnInfoSetMessage
> = async (messageBody, languages) => {
  const { orderRefundTemplateId } = readAdditionalConfiguration();

  const orderId = messageBody.resource.id;
  const order = await getOrderById(orderId);
  if (order) {
    const customer = await getCustomerFromOrder(order);
    if (!messageBody.returnInfo) {
      logger.info(`No returned line item is found for order ${orderId}`);
      return undefined;
    }

    let returnInfo: Array<ReturnInfo> = [];
    if (Array.isArray(messageBody.returnInfo)) {
      returnInfo = messageBody.returnInfo;
    } else {
      returnInfo = [messageBody.returnInfo];
    }

    const returnedLineItemId = returnInfo
      .flatMap((returnInfo) => returnInfo.items)
      .map((item) => {
        return 'lineItemId' in item ? item.lineItemId : '';
      });
    const returnedLineItems = [];

    const locale = findLocale(customer, order);

    for (const lineItem of order.lineItems) {
      if (returnedLineItemId.includes(lineItem.id)) {
        // Rule out those line items which are not going to be returned.
        const item = mapLineItem(lineItem, locale, languages);
        returnedLineItems.push(item);
      }
    }
    if (returnedLineItems.length > 0) {
      const orderDetails: HandlerReturnType['templateData'] = {
        ...mapOrderDefaults(order, customer, locale),
        orderState: order.orderState,
        orderShipmentState: order.shipmentState,
        orderLineItems: returnedLineItems,
      };

      return {
        recipientEmailAddresses: [orderDetails.customerEmail],
        templateId: orderRefundTemplateId,
        templateData: orderDetails,
        successMessage: `Order state change email has been sent to ${orderDetails.customerEmail}.`,
        preSuccessMessage: `Ready to send order state change email : customerEmail=${orderDetails.customerEmail}, orderNumber=${orderDetails.orderNumber}, customerCreationTime=${orderDetails.orderCreationTime}`,
        locale: locale,
      };
    } else {
      throw new CustomError(
        HTTP_STATUS_BAD_REQUEST,
        `No returned line item is found for order ${orderId}`
      );
    }
  } else {
    throw new CustomError(
      HTTP_STATUS_BAD_REQUEST,
      `Unable to get order details with order ID ${orderId}`
    );
  }
};
