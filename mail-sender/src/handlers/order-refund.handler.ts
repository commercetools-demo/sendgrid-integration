import CustomError from '../errors/custom.error';
import { HTTP_STATUS_BAD_REQUEST } from '../constants/http-status.constants';
import { convertMoneyToText } from '../utils/money.utils';
import {
  Customer,
  Order,
  ReturnInfoAddedMessage,
  ReturnInfoSetMessage,
} from '@commercetools/platform-sdk';
import { readAdditionalConfiguration } from '../utils/config.utils';
import { getCustomerById } from '../ctp/customer';
import { getOrderById } from '../ctp/order';
import { HandlerReturnType } from '../types/index.types';

const DEFAULT_LOCALE = 'en-US';
const DEFAULT_CUSTOMER_NAME = 'Customer';

const buildOrderDetails = (
  order: Order,
  customer: Customer,
  returnedLineItems: Array<any>
) => {
  return {
    orderNumber: order.orderNumber ? order.orderNumber : '',
    customerEmail: order.customerEmail ? order.customerEmail : customer.email,
    customerFirstName: customer?.firstName
      ? customer.firstName
      : DEFAULT_CUSTOMER_NAME,
    customerMiddleName: customer?.middleName ? customer.middleName : '',
    customerLastName: customer?.lastName ? customer.lastName : '',
    orderCreationTime: order.createdAt,
    orderState: order.orderState,
    orderShipmentState: order.shipmentState,
    orderTotalPrice: convertMoneyToText(order.totalPrice, order.locale),
    orderTaxedPrice: order.taxedPrice
      ? convertMoneyToText(order.taxedPrice.totalNet, order.locale)
      : '',
    orderLineItems: returnedLineItems,
  };
};

export const handleReturnInfo = async (
  messageBody: ReturnInfoAddedMessage | ReturnInfoSetMessage
): Promise<HandlerReturnType> => {
  const { orderRefundTemplateId } = readAdditionalConfiguration();

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
    const returnedLineItemId = (order.returnInfo || [])
      .flatMap((returnInfo) => returnInfo.items)
      .map((item) => {
        return 'lineItemId' in item ? item.lineItemId : '';
      });
    const returnedLineItems = [];

    for (const lineItem of order.lineItems) {
      if (returnedLineItemId.includes(lineItem.id)) {
        // Rule out those line items which are not going to be returned.
        const item = {
          productName: lineItem.name[DEFAULT_LOCALE],
          productQuantity: lineItem.quantity,
          productSku: lineItem.variant.sku,
          productImage: lineItem.variant.images
            ? lineItem.variant.images[0].url
            : '',
          productSubTotal: convertMoneyToText(
            lineItem.totalPrice,
            order.locale
          ),
        };
        returnedLineItems.push(item);
      }
    }
    if (returnedLineItems.length > 0) {
      const orderDetails = buildOrderDetails(
        order,
        customer,
        returnedLineItems
      );
      return {
        recipientEmailAddresses: [orderDetails.customerEmail],
        templateId: orderRefundTemplateId,
        templateData: orderDetails,
        successMessage: `Order state change email has been sent to ${orderDetails.customerEmail}.`,
        preSuccessMessage: `Ready to send order state change email : customerEmail=${orderDetails.customerEmail}, orderNumber=${orderDetails.orderNumber}, customerMiddleName=${orderDetails.customerMiddleName}, customerCreationTime=${orderDetails.orderCreationTime}`,
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
