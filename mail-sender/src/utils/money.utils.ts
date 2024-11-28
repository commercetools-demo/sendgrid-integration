import { TypedMoney } from '@commercetools/platform-sdk';

export function convertMoneyToText(money: TypedMoney, locale?: string) {
  if (
    money.type === 'centPrecision' &&
    money.centAmount &&
    money.fractionDigits
  ) {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: money.currencyCode,
    }).format(money.centAmount / Math.pow(10, money.fractionDigits));
  }
  return '';
}
