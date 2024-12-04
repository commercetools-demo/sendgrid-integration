import { getCustomerById } from '../ctp/customer';
import CustomError from '../errors/custom.error';
import { HTTP_STATUS_BAD_REQUEST } from '../constants/http-status.constants';
import { Order } from '@commercetools/platform-sdk';

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
