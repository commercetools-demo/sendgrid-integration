import { Customer } from '@commercetools/platform-sdk';
import { readAdditionalConfiguration } from './config.utils';

export const findLocale = (customer: Customer) => {
  return (
    customer.locale ||
    customer.addresses[0].country ||
    readAdditionalConfiguration().defaultLocale
  );
};
