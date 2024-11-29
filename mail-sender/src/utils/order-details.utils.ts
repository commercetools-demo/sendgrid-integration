import { Customer, Order } from '@commercetools/platform-sdk';
import { convertDateToText } from './date.utils';
import { findLocale } from './customer.utils';

const DEFAULT_CUSTOMER_NAME = 'Customer';

export const orderDefaults = (order: Order, customer: Customer) => {
  const dateAndTime = convertDateToText(order.createdAt, findLocale(customer));
  return {
    orderNumber: order.orderNumber || '',
    customerEmail: order.customerEmail ? order.customerEmail : customer?.email,
    customerFirstName: customer?.firstName
      ? customer.firstName
      : DEFAULT_CUSTOMER_NAME,
    customerMiddleName: customer?.middleName || '',
    customerLastName: customer?.lastName || '',
    orderCreationTime: dateAndTime.time,
    orderCreationDate: dateAndTime.date,
  };
};
