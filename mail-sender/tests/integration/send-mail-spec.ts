import {
  readAdditionalConfiguration,
  readConfiguration,
} from '../../src/utils/config.utils';
import { sendMail } from '../../src/handlers/send-mail';
import { faker } from '@faker-js/faker';

describe('Testing router', () => {
  beforeEach(() => {
    (readConfiguration as jest.Mock).mockClear();
    (readAdditionalConfiguration as jest.Mock).mockClear();
  });

  test.skip('Post to non existing route', async () => {
    await sendMail(readAdditionalConfiguration().senderEmailAddress, {
      recipientEmailAddresses: ['philipp.hofmann@commercetools.com'],
      templateId: readAdditionalConfiguration().orderConfirmationTemplateId,
      templateData: {
        orderNumber: '2024-11-29-79164',
        customerEmail: faker.string.sample(),
        customerFirstName: faker.person.firstName(),
        customerMiddleName: faker.person.middleName(),
        customerLastName: faker.person.lastName(),
        orderCreationTime: '12:50:29',
        orderCreationDate: '29.11.2024',
        orderTotalPrice: '1.299,00 €',
        orderTaxedPrice: '1.091,60 €',
        orderLineItems: [
          {
            productQuantity: 1,
            productSku: 'NTSS-02',
            productImage:
              'https://storage.googleapis.com/merchant-center-europe/sample-data/goodstore/Nala_Two_Seater_Sofa-2.1.jpeg',
            productSubTotal: '1.299,00 €',
          },
        ],
      },
      successMessage: '',
      preSuccessMessage: '',
    });
  });
});
