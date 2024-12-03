import { readdirSync, readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';
import { createFolder, htmlFromTemplate } from './utils';
import { MJMLParsingOptions } from 'mjml-core';

const getAllRunner = async () => {
  const mjmlFolder = resolve('src', 'templateengine', 'mjml');
  const data: Record<string, any> = {
    order: {
      heroMessage: 'Order Confirmation',
      orderMessage: {
        welcome: 'Hey there,',
        text: 'Thank you for your order! We will notify you as soon as your item(s) have been dispatched.you will find the estimated delivery date below.to view or amend your order, visit My Orders on our website.',
        shippingConfirmation: 'Shipping Confirmation',
        delivery: 'Delivery:',
        deliveryDate: 'Tuesday, November 27th',
        deliveryTo: 'The shipment goes to:',
        orderNumber: 'Order Number: #',
        trackOrder: 'Track Order',
        orderSummary: 'Order Summary',
        soldBy: 'Sold By',
        amount: 'Amount',
        totalAmount: 'Total Amount',
      },
      total: '$2134.00',
      orderTrackingLink:
        'https://b2c-emeademos.frontend.site/en/account/?hash=orders&id=order_b4a877e7-f706-47c5-b9e9-1ca67ea0b299',
      orderNumberLink:
        'https://b2c-emeademos.frontend.site/en/account/?hash=orders&id=order_b4a877e7-f706-47c5-b9e9-1ca67ea0b299',
      customerFirstName: 'Firstname',
      customerLastName: 'Lastname',
      address: {
        streetName: 'Mainroad',
        streetNumber: '66',
        postalCode: '1234 BB',
        city: 'City',
        state: 'State',
        country: 'United States of something',
      },
      orderLineItems: [
        {
          productName: 'Name 1',
          productQuantity: '1',
          productSku: '123',
          productImage:
            'https://storage.googleapis.com/merchant-center-europe/sample-data/b2bstore/led-work-light.webp',
          productSubTotal: '$49.99',
        },
        {
          productName: 'Name 2',
          productQuantity: '2',
          productSku: '234',
          productImage:
            'https://storage.googleapis.com/merchant-center-europe/sample-data/b2bstore/pin-and-bushing-kit.webp',
          productSubTotal: '$149.99',
        },
      ],
    },
  };

  const items = readdirSync(mjmlFolder, { withFileTypes: true })
    .filter((item) => item.isFile())
    .filter((item) => item.name.endsWith('.mjml'))
    .map((item) => item.name)
    .map((item) => item.split('.')[0]);

  for (const item of items) {
    const template = readFileSync(resolve(mjmlFolder, item + '.mjml'), 'utf-8');

    const options: MJMLParsingOptions = {
      filePath: mjmlFolder,
    };
    const message = htmlFromTemplate(template, data[item], options);
    const templateStorage = resolve('build', 'templates');
    createFolder(templateStorage);
    const filename = resolve(templateStorage, item + '.html');
    writeFileSync(filename, message);
  }
};

getAllRunner().catch((e) => console.error(e));
