import CustomError from '../errors/custom.error';
import { HTTP_STATUS_BAD_REQUEST } from '../constants/http-status.constants';
import { convertMoneyToText } from '../utils/money.utils';
import {
  OrderShipmentStateChangedMessage,
  OrderStateChangedMessage,
} from '@commercetools/platform-sdk';
import { getOrderById } from '../ctp/order';
import { getCustomerById } from '../ctp/customer';
import { readAdditionalConfiguration } from '../utils/config.utils';
import { HandlerReturnType } from '../types/index.types';
import { findLocale } from '../utils/customer.utils';
import { orderDefaults } from '../utils/order-details.utils';

export const handleOrderStateChanged = async (
  messageBody: OrderStateChangedMessage | OrderShipmentStateChangedMessage
): Promise<HandlerReturnType> => {
  const { orderStateChangeTemplateId } = readAdditionalConfiguration();

  const orderId = messageBody.resource.id;
  const order = await getOrderById(orderId);
  if (order) {
    let customer;
    if (order.customerId) {
      customer = await getCustomerById(order.customerId);
    } else {
      throw new CustomError(
        HTTP_STATUS_BAD_REQUEST,
        `Unable to get customer details with customer ID ${order.customerId}`
      );
    }

    const orderLineItems = [];

    for (const lineItem of order.lineItems) {
      const item = {
        productName: lineItem.name[findLocale(customer)],
        productQuantity: lineItem.quantity,
        productSku: lineItem.variant.sku,
        productImage: lineItem.variant.images
          ? lineItem.variant.images[0].url
          : '',
        productSubTotal: convertMoneyToText(
          lineItem.totalPrice,
          findLocale(customer)
        ),
      };
      orderLineItems.push(item);
    }
    const orderDetails = {
      ...orderDefaults(order, customer),
      orderState: order.orderState,
      orderShipmentState: order.shipmentState,
      orderTotalPrice: convertMoneyToText(
        order.totalPrice,
        findLocale(customer)
      ),
      orderTaxedPrice: order.taxedPrice
        ? convertMoneyToText(order.taxedPrice.totalNet, findLocale(customer))
        : '',
      orderLineItems,
    };

    return {
      recipientEmailAddresses: [orderDetails.customerEmail],
      templateId: orderStateChangeTemplateId,
      templateData: orderDetails,
      successMessage: `Order state change email has been sent to ${orderDetails.customerEmail}.`,
      preSuccessMessage: `Ready to send order state change email : customerEmail=${orderDetails.customerEmail}, orderNumber=${orderDetails.orderNumber}, customerMiddleName=${orderDetails.customerMiddleName}, customerCreationTime=${orderDetails.orderCreationTime}`,
    };
  } else {
    throw new CustomError(
      HTTP_STATUS_BAD_REQUEST,
      `Unable to get order details with order ID ${orderId}`
    );
  }
};
