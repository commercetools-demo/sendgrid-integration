import CustomError from '../errors/custom.error';
import { HTTP_STATUS_BAD_REQUEST } from '../constants/http-status.constants';
import { convertMoneyToText } from '../utils/money.utils';
import {
  Customer,
  Order,
  ReturnInfoAddedMessage,
  ReturnInfoSetMessage,
  ReturnInfo,
} from '@commercetools/platform-sdk';
import { readAdditionalConfiguration } from '../utils/config.utils';
import { getOrderById } from '../ctp/order';
import { HandlerReturnType } from '../types/index.types';
import { mapNames, findLocale, mapEmail } from '../utils/customer.utils';
import { convertDateToText } from '../utils/date.utils';
import { logger } from '../utils/logger.utils';
import { getCustomerFromOrder } from '../utils/order.utils';

const buildOrderDetails = (
  order: Order,
  customer: Customer | undefined,
  returnedLineItems: Array<any>
) => {
  const dateAndTime = convertDateToText(
    order.createdAt,
    findLocale(customer, order)
  );
  return {
    orderNumber: order.orderNumber || '',
    ...mapEmail(customer, order),
    ...mapNames(customer, order),
    orderCreationTime: dateAndTime.time,
    orderCreationDate: dateAndTime.date,
    orderState: order.orderState,
    orderShipmentState: order.shipmentState,
    orderTotalPrice: convertMoneyToText(
      order.totalPrice,
      findLocale(customer, order)
    ),
    orderTaxedPrice: order.taxedPrice
      ? convertMoneyToText(
          order.taxedPrice.totalNet,
          findLocale(customer, order)
        )
      : '',
    orderLineItems: returnedLineItems,
  };
};

export const handleReturnInfo = async (
  messageBody: ReturnInfoAddedMessage | ReturnInfoSetMessage
): Promise<HandlerReturnType | undefined> => {
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

    for (const lineItem of order.lineItems) {
      if (returnedLineItemId.includes(lineItem.id)) {
        // Rule out those line items which are not going to be returned.
        const item = {
          productName: lineItem.name[findLocale(customer, order)],
          productQuantity: lineItem.quantity,
          productSku: lineItem.variant.sku,
          productImage: lineItem.variant.images
            ? lineItem.variant.images[0].url
            : '',
          productSubTotal: convertMoneyToText(
            lineItem.totalPrice,
            findLocale(customer, order)
          ),
        };
        returnedLineItems.push(item);
      }
    }
    if (returnedLineItems.length > 0) {
      let orderDetails: HandlerReturnType['templateData'] = buildOrderDetails(
        order,
        customer,
        returnedLineItems
      );
      orderDetails = {
        ...orderDetails,
        messages: {
          heroMessage: 'Order Return Change',
          heroImage:
            'http://cdn.mcauto-images-production.sendgrid.net/fcda5b5400c10505/d9dee00e-a252-4211-9fac-ef09b9d339e8/1200x300.png',
          welcome: 'Hey there,',
          text: 'The state of your order has changed.',
        },
      };

      return {
        recipientEmailAddresses: [orderDetails.customerEmail],
        templateId: orderRefundTemplateId,
        templateData: orderDetails,
        successMessage: `Order state change email has been sent to ${orderDetails.customerEmail}.`,
        preSuccessMessage: `Ready to send order state change email : customerEmail=${orderDetails.customerEmail}, orderNumber=${orderDetails.orderNumber}, customerCreationTime=${orderDetails.orderCreationTime}`,
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
