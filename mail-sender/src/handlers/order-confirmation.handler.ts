import CustomError from '../errors/custom.error';
import { HTTP_STATUS_BAD_REQUEST } from '../constants/http-status.constants';
import { convertMoneyToText } from '../utils/money.utils';
import { OrderCreatedMessage } from '@commercetools/platform-sdk';
import { readAdditionalConfiguration } from '../utils/config.utils';
import { getCustomerById } from '../ctp/customer';
import { HandlerReturnType } from '../types/index.types';

const DEFAULT_LOCALE = 'en-US';
const DEFAULT_CUSTOMER_NAME = 'Customer';

export const handleOrderCreatedMessage = async (
  messageBody: OrderCreatedMessage
): Promise<HandlerReturnType> => {
  const { orderConfirmationTemplateId } = readAdditionalConfiguration();

  const orderId = messageBody.resource.id;
  const order = messageBody.order;

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
        productName: lineItem.name[order.locale || DEFAULT_LOCALE],
        productQuantity: lineItem.quantity,
        productSku: lineItem.variant.sku,
        productImage: lineItem.variant.images
          ? lineItem.variant.images[0].url
          : '',
        productSubTotal: convertMoneyToText(lineItem.totalPrice, order.locale),
      };
      orderLineItems.push(item);
    }
    const orderDetails = {
      orderNumber: order.orderNumber ? order.orderNumber : '',
      customerEmail: order.customerEmail
        ? order.customerEmail
        : customer?.email,
      customerFirstName: customer?.firstName
        ? customer.firstName
        : DEFAULT_CUSTOMER_NAME,
      customerMiddleName: customer?.middleName ? customer.middleName : '',
      customerLastName: customer?.lastName ? customer.lastName : '',
      orderCreationTime: order.createdAt,
      orderTotalPrice: convertMoneyToText(order.totalPrice, order.locale),
      orderTaxedPrice: order.taxedPrice
        ? convertMoneyToText(order.taxedPrice.totalNet, order.locale)
        : '',
      orderLineItems,
    };

    return {
      recipientEmailAddresses: [orderDetails.customerEmail],
      templateId: orderConfirmationTemplateId,
      templateData: orderDetails,
      successMessage: `Confirmation email of customer registration has been sent to ${orderDetails.customerEmail}.`,
      preSuccessMessage: `Ready to send order confirmation email of customer registration : customerEmail=${orderDetails.customerEmail}, orderNumber=${orderDetails.orderNumber}, customerMiddleName=${orderDetails.customerMiddleName}, customerCreationTime=${orderDetails.orderCreationTime}`,
    };
  } else {
    throw new CustomError(
      HTTP_STATUS_BAD_REQUEST,
      `Unable to get order details with order ID ${orderId}`
    );
  }
};
