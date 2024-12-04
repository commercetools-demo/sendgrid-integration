import CustomError from '../errors/custom.error';
import { HTTP_STATUS_BAD_REQUEST } from '../constants/http-status.constants';
import {
  OrderShipmentStateChangedMessage,
  OrderStateChangedMessage,
} from '@commercetools/platform-sdk';
import { getOrderById } from '../ctp/order';
import { readAdditionalConfiguration } from '../utils/config.utils';
import { HandlerReturnType } from '../types/index.types';
import { findLocale } from '../utils/customer.utils';
import { getCustomerFromOrder, mapOrderDefaults } from '../utils/order.utils';
import { getProject } from '../ctp/project';
import { mapLineItem } from '../utils/lineitem.utils';

export const handleOrderStateChanged = async (
  messageBody: OrderStateChangedMessage | OrderShipmentStateChangedMessage
): Promise<HandlerReturnType> => {
  const { orderStateChangeTemplateId } = readAdditionalConfiguration();

  const orderId = messageBody.resource.id;
  const order = await getOrderById(orderId);
  if (order) {
    const customer = await getCustomerFromOrder(order);

    const locale = findLocale(customer, order);
    const { languages } = await getProject();

    let orderDetails: HandlerReturnType['templateData'] = {
      ...mapOrderDefaults(order, customer, locale),
      orderState: order.orderState,
      orderShipmentState: order.shipmentState,
      orderLineItems: order.lineItems.map((lineItem) => {
        return mapLineItem(lineItem, locale, languages);
      }),
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
