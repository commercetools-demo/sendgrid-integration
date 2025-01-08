import CustomError from '../errors/custom.error';
import { HTTP_STATUS_BAD_REQUEST } from '../constants/http-status.constants';
import { OrderStateChangedMessage } from '@commercetools/platform-sdk';
import { getOrderById } from '../ctp/order';
import { readAdditionalConfiguration } from '../utils/config.utils';
import { HandlerReturnType, HandlerType } from '../types/index.types';
import { findLocale } from '../utils/customer.utils';
import { getCustomerFromOrder, mapOrderDefaults } from '../utils/order.utils';

export const handleOrderStateChanged: HandlerType<
  OrderStateChangedMessage
> = async (messageBody, _languages) => {
  const { orderStateChangeTemplateId } = readAdditionalConfiguration();

  const orderId = messageBody.resource.id;
  const order = await getOrderById(orderId);
  if (order) {
    const customer = await getCustomerFromOrder(order);

    const locale = findLocale(customer, order);

    const orderDetails: HandlerReturnType['templateData'] = {
      ...mapOrderDefaults(order, customer, locale),
      orderState: order.orderState,
      oldOrderState: messageBody.oldOrderState ?? '',
    };

    return {
      recipientEmailAddresses: [orderDetails.customerEmail],
      templateId: orderStateChangeTemplateId,
      templateData: orderDetails,
      successMessage: `Order state change email has been sent to ${orderDetails.customerEmail}.`,
      preSuccessMessage: `Ready to send order state change email : customerEmail=${orderDetails.customerEmail}, orderNumber=${orderDetails.orderNumber}, customerCreationTime=${orderDetails.orderCreationTime}`,
      locale: locale,
    };
  } else {
    throw new CustomError(
      HTTP_STATUS_BAD_REQUEST,
      `Unable to get order details with order ID ${orderId}`
    );
  }
};
