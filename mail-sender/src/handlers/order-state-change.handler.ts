import CustomError from '../errors/custom.error';
import { HTTP_STATUS_BAD_REQUEST } from '../constants/http-status.constants';
import { convertMoneyToText } from '../utils/money.utils';
import {
  OrderShipmentStateChangedMessage,
  OrderStateChangedMessage,
} from '@commercetools/platform-sdk';
import { getOrderById } from '../ctp/order';
import { readAdditionalConfiguration } from '../utils/config.utils';
import { HandlerReturnType } from '../types/index.types';
import { mapNames, findLocale, mapEmail } from '../utils/customer.utils';
import { convertDateToText } from '../utils/date.utils';
import { getCustomerFromOrder } from '../utils/order.utils';

export const handleOrderStateChanged = async (
  messageBody: OrderStateChangedMessage | OrderShipmentStateChangedMessage
): Promise<HandlerReturnType> => {
  const { orderStateChangeTemplateId } = readAdditionalConfiguration();

  const orderId = messageBody.resource.id;
  const order = await getOrderById(orderId);
  if (order) {
    const customer = await getCustomerFromOrder(order);

    const orderLineItems = [];

    for (const lineItem of order.lineItems) {
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
      orderLineItems.push(item);
    }
    const dateAndTime = convertDateToText(
      order.createdAt,
      findLocale(customer, order)
    );
    let orderDetails: HandlerReturnType['templateData'] = {
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
      orderLineItems,
    };

    orderDetails = {
      ...orderDetails,
      messages: {
        heroMessage: 'Order State Change',
        heroImage:
          'http://cdn.mcauto-images-production.sendgrid.net/fcda5b5400c10505/d9dee00e-a252-4211-9fac-ef09b9d339e8/1200x300.png',
        welcome: 'Hey there,',
        text: 'The state of your order has changed.',
      },
    };

    return {
      recipientEmailAddresses: [orderDetails.customerEmail],
      templateId: orderStateChangeTemplateId,
      templateData: orderDetails,
      successMessage: `Order state change email has been sent to ${orderDetails.customerEmail}.`,
      preSuccessMessage: `Ready to send order state change email : customerEmail=${orderDetails.customerEmail}, orderNumber=${orderDetails.orderNumber}, customerCreationTime=${orderDetails.orderCreationTime}`,
    };
  } else {
    throw new CustomError(
      HTTP_STATUS_BAD_REQUEST,
      `Unable to get order details with order ID ${orderId}`
    );
  }
};
