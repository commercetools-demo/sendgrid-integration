import CustomError from '../errors/custom.error';
import { HTTP_STATUS_BAD_REQUEST } from '../constants/http-status.constants';
import { OrderCreatedMessage } from '@commercetools/platform-sdk';
import { readAdditionalConfiguration } from '../utils/config.utils';
import { HandlerReturnType, HandlerType } from '../types/index.types';
import { findLocale, mapAddress } from '../utils/customer.utils';
import { getCustomerFromOrder, mapOrderDefaults } from '../utils/order.utils';
import { mapLineItem } from '../utils/lineitem.utils';

export const handleOrderCreatedMessage: HandlerType<
  OrderCreatedMessage
> = async (messageBody, languages) => {
  const { orderConfirmationTemplateId } = readAdditionalConfiguration();

  const orderId = messageBody.resource.id;
  const order = messageBody.order;

  if (order) {
    const customer = await getCustomerFromOrder(order);

    const locale = findLocale(customer, order);

    const orderDetails: HandlerReturnType['templateData'] = {
      ...mapOrderDefaults(order, customer, locale),
      orderLineItems: order.lineItems.map((lineItem) => {
        return mapLineItem(lineItem, locale, languages);
      }),
      ...mapAddress(customer, order),
    };

    //Fake for now
    const createdAt = new Date(order.createdAt);
    const newDate = new Date(createdAt);
    newDate.setDate(createdAt.getDate() + 2);

    return {
      recipientEmailAddresses: [orderDetails.customerEmail],
      templateId: orderConfirmationTemplateId,
      templateData: orderDetails,
      successMessage: `Confirmation email of customer registration has been sent to ${orderDetails.customerEmail}.`,
      preSuccessMessage: `Ready to send order confirmation email of customer registration : customerEmail=${orderDetails.customerEmail}, orderNumber=${orderDetails.orderNumber}, customerCreationTime=${orderDetails.orderCreationTime}`,
      locale: locale,
    };
  } else {
    throw new CustomError(
      HTTP_STATUS_BAD_REQUEST,
      `Unable to get order details with order ID ${orderId}`
    );
  }
};
