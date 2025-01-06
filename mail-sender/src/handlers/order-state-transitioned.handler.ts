import CustomError from '../errors/custom.error';
import { HTTP_STATUS_BAD_REQUEST } from '../constants/http-status.constants';
import {
  OrderStateTransitionMessage
} from '@commercetools/platform-sdk';
import { getOrderById } from '../ctp/order';
import { readAdditionalConfiguration } from '../utils/config.utils';
import { HandlerReturnType, HandlerType } from '../types/index.types';
import { findLocale } from '../utils/customer.utils';
import { getCustomerFromOrder, mapOrderDefaults } from '../utils/order.utils';
import { mapLineItem } from '../utils/lineitem.utils';
import { formatLocalizedString } from '../utils/localization.utils';

export const handleOrderStateTransitioned: HandlerType<
  OrderStateTransitionMessage
> = async (messageBody, languages) => {
  const { orderStateChangeTemplateId } = readAdditionalConfiguration();

  const orderId = messageBody.resource.id;
  const order = await getOrderById(orderId, ['state']);
  if (order) {
    const customer = await getCustomerFromOrder(order);

    const locale = findLocale(customer, order);

    const orderDetails: HandlerReturnType['templateData'] = {
      ...mapOrderDefaults(order, customer, locale),
      orderState: formatLocalizedString(order.state?.obj?.name || {}, locale, languages),
      orderShipmentState: order.shipmentState,
      orderLineItems: order.lineItems.map((lineItem) => {
        return mapLineItem(lineItem, locale, languages);
      }),
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
