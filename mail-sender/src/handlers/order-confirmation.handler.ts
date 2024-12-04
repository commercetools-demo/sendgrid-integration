import CustomError from '../errors/custom.error';
import { HTTP_STATUS_BAD_REQUEST } from '../constants/http-status.constants';
import { OrderCreatedMessage } from '@commercetools/platform-sdk';
import { readAdditionalConfiguration } from '../utils/config.utils';
import { HandlerReturnType } from '../types/index.types';
import { findLocale, mapAddress } from '../utils/customer.utils';
import { getCustomerFromOrder, mapOrderDefaults } from '../utils/order.utils';
import { getProject } from '../ctp/project';
import { mapLineItem } from '../utils/lineitem.utils';

export const handleOrderCreatedMessage = async (
  messageBody: OrderCreatedMessage
): Promise<HandlerReturnType> => {
  const { orderConfirmationTemplateId } = readAdditionalConfiguration();

  const orderId = messageBody.resource.id;
  const order = messageBody.order;

  if (order) {
    const customer = await getCustomerFromOrder(order);

    const locale = findLocale(customer, order);
    const { languages } = await getProject();

    let orderDetails: HandlerReturnType['templateData'] = {
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
    orderDetails = {
      ...orderDetails,
      messages: {
        heroMessage: 'Order Confirmation',
        heroImage:
          'http://cdn.mcauto-images-production.sendgrid.net/fcda5b5400c10505/d9dee00e-a252-4211-9fac-ef09b9d339e8/1200x300.png',
        welcome: 'Hey there,',
        text: 'Thank you for your order! We will notify you as soon as your item(s) have been dispatched.you will find the estimated delivery date below.to view or amend your order, visit My Orders on our website.',
        shippingConfirmation: 'Shipping Confirmation',
        delivery: 'Delivery:',
        deliveryDate: newDate.toLocaleDateString(locale),
        deliveryTo: 'The shipment goes to:',
        orderNumberText: 'Order Number: #',
        trackOrder: 'Track Order',
        orderSummary: 'Order Summary',
        soldBy: 'Sold By',
        amount: 'Amount',
        totalAmount: 'Total Amount',
        orderTrackingLink:
          'https://b2c-emeademos.frontend.site/en/account/?hash=orders&id=order_b4a877e7-f706-47c5-b9e9-1ca67ea0b299',
        orderNumberLink:
          'https://b2c-emeademos.frontend.site/en/account/?hash=orders&id=order_b4a877e7-f706-47c5-b9e9-1ca67ea0b299',
      },
    };

    return {
      recipientEmailAddresses: [orderDetails.customerEmail],
      templateId: orderConfirmationTemplateId,
      templateData: orderDetails,
      successMessage: `Confirmation email of customer registration has been sent to ${orderDetails.customerEmail}.`,
      preSuccessMessage: `Ready to send order confirmation email of customer registration : customerEmail=${orderDetails.customerEmail}, orderNumber=${orderDetails.orderNumber}, customerCreationTime=${orderDetails.orderCreationTime}`,
    };
  } else {
    throw new CustomError(
      HTTP_STATUS_BAD_REQUEST,
      `Unable to get order details with order ID ${orderId}`
    );
  }
};
