import CustomError from '../errors/custom.error';
import { HTTP_STATUS_BAD_REQUEST } from '../constants/http-status.constants';
import { OrderShipmentStateChangedMessage } from '@commercetools/platform-sdk';
import { getOrderById } from '../ctp/order';
import { readAdditionalConfiguration } from '../utils/config.utils';
import { HandlerReturnType, HandlerType } from '../types/index.types';
import { findLocale } from '../utils/customer.utils';
import { getCustomerFromOrder, mapOrderDefaults } from '../utils/order.utils';

export const handleShipmentStateChanged: HandlerType<
  OrderShipmentStateChangedMessage
> = async (messageBody, _languages) => {
  const { shipmentStateChangeTemplateId } = readAdditionalConfiguration();

  const orderId = messageBody.resource.id;
  const order = await getOrderById(orderId);
  if (order) {
    const customer = await getCustomerFromOrder(order);

    const locale = findLocale(customer, order);

    const orderDetails: HandlerReturnType['templateData'] = {
      ...mapOrderDefaults(order, customer, locale),
      oldShipmentState: messageBody.oldShipmentState ?? '',
      shipmentState: order.shipmentState,
    };

    return {
      recipientEmailAddresses: [orderDetails.customerEmail],
      templateId: shipmentStateChangeTemplateId,
      templateData: orderDetails,
      successMessage: `Shipment state change email has been sent to ${orderDetails.customerEmail}.`,
      preSuccessMessage: `Ready to send shipment state change email : customerEmail=${orderDetails.customerEmail}, oldShipmentState: ${orderDetails.oldShipmentState}, shipmentState: ${orderDetails.shipmentState}, orderNumber=${orderDetails.orderNumber}`,
      locale: locale,
    };
  } else {
    throw new CustomError(
      HTTP_STATUS_BAD_REQUEST,
      `Unable to get order details with order ID ${orderId}`
    );
  }
};
