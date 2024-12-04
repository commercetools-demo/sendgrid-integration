import { resolve } from 'path';
import { run } from './mjml';

const getAllRunner = async () => {
  const mjmlFolder = resolve('src', 'templateengine', 'mjml');
  const targetDir = resolve('build', 'templates');
  const data: Record<string, any> = {
    'customer-created': {
      heroMessage: 'Customer Created',
      heroImage:
        'http://cdn.mcauto-images-production.sendgrid.net/fcda5b5400c10505/d9dee00e-a252-4211-9fac-ef09b9d339e8/1200x300.png',
      customerName: 'Firstname',
      customerMessage: {
        welcome: 'Hey',
        text: 'Thank you for signing up!',
        verificationText: "Let's verify your account so you can start.",
        verificationButtonText: 'Verifiy your account',
        verificationValidityText:
          'Your link is active for 48 hours. After that, you will need to resend the verification email.',
      },
      verificationLink: 'asdf',
    },
    order: {
      heroMessage: 'Order Confirmation',
      heroImage:
        'http://cdn.mcauto-images-production.sendgrid.net/fcda5b5400c10505/d9dee00e-a252-4211-9fac-ef09b9d339e8/1200x300.png',
      orderMessage: {
        welcome: 'Hey there,',
        text: 'Thank you for your order! We will notify you as soon as your item(s) have been dispatched.you will find the estimated delivery date below.to view or amend your order, visit My Orders on our website.',
        shippingConfirmation: 'Shipping Confirmation',
        delivery: 'Delivery:',
        deliveryDate: 'Tuesday, November 27th',
        deliveryTo: 'The shipment goes to:',
        orderNumberText: 'Order Number: #',
        orderNumber: '2q34',
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
  run(mjmlFolder, targetDir, data);
};

getAllRunner().catch((e) => console.error(e));
