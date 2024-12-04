import { getCustomerById } from '../ctp/customer';
import CustomError from '../errors/custom.error';
import { HTTP_STATUS_BAD_REQUEST } from '../constants/http-status.constants';
import { Customer, Order } from '@commercetools/platform-sdk';
import { mapEmail, mapNames } from './customer.utils';
import { convertMoneyToText } from './money.utils';
import { convertDateToText } from './date.utils';

export const getCustomerFromOrder = async (order: Order) => {
  if (order.customerId) {
    return await getCustomerById(order.customerId);
  } else if (!order.customerEmail) {
    throw new CustomError(
      HTTP_STATUS_BAD_REQUEST,
      `Unable to either get customer or email from order`
    );
  }
  return undefined;
};

export const mapOrderDefaults = (
  order: Order,
  customer: Customer | undefined,
  locale: string
) => {
  const dateAndTime = convertDateToText(order.createdAt, locale);
  return {
    orderNumber: order.orderNumber || '',
    ...mapEmail(customer, order),
    ...mapNames(customer, order),
    orderCreationTime: dateAndTime.time,
    orderCreationDate: dateAndTime.date,
    orderTotalPrice: convertMoneyToText(order.totalPrice, locale),
    orderTaxedPrice: order.taxedPrice
      ? convertMoneyToText(order.taxedPrice.totalNet, locale)
      : '',
  };
};
