import { LineItem } from '@commercetools/platform-sdk';
import { formatLocalizedString } from './localization.utils';
import { convertMoneyToText } from './money.utils';

export const mapLineItem = (
  lineItem: LineItem,
  locale: string,
  languages: Array<string>
) => {
  return {
    productName: formatLocalizedString(lineItem.name, locale, languages),
    productQuantity: lineItem.quantity,
    productSku: lineItem.variant.sku,
    productImage: lineItem.variant.images ? lineItem.variant.images[0].url : '',
    productSubTotal: convertMoneyToText(lineItem.totalPrice, locale),
  };
};
