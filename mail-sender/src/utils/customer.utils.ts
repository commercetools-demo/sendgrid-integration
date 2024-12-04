import { Customer, Order } from '@commercetools/platform-sdk';
import { readAdditionalConfiguration } from './config.utils';

export const findLocale = (customer?: Customer, order?: Order) => {
  return (
    customer?.locale ||
    customer?.addresses[0].country ||
    order?.locale ||
    order?.shippingAddress?.country ||
    readAdditionalConfiguration().defaultLocale
  );
};

export const mapEmail = (customer?: Customer, order?: Order) => {
  return {
    customerEmail: order?.customerEmail || customer?.email || '',
  };
};

export const mapNames = (customer?: Customer, order?: Order) => {
  return {
    customerFirstName:
      customer?.firstName || order?.shippingAddress?.firstName || '',
    customerLastName:
      customer?.lastName || order?.shippingAddress?.lastName || '',
  };
};

export const mapAddress = (customer?: Customer, order?: Order) => {
  return {
    shippingAddress: {
      firstName: order?.shippingAddress?.firstName || customer?.firstName || '',
      lastName: order?.shippingAddress?.lastName || customer?.lastName || '',
      country: order?.shippingAddress?.country || '',
      streetName: order?.shippingAddress?.streetName || '',
      streetNumber: order?.shippingAddress?.streetNumber || '',
      additionalStreetInfo: order?.shippingAddress?.additionalStreetInfo || '',
      postalCode: order?.shippingAddress?.postalCode || '',
      city: order?.shippingAddress?.city || '',
      state: order?.shippingAddress?.state || '',
      company: order?.shippingAddress?.company || '',
    },
  };
};
