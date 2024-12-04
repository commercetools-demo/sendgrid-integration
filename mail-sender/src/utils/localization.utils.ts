import { LocalizedString } from '@commercetools/platform-sdk';

export const findFallbackLocale = (
  localizedString: LocalizedString,
  fallbackOrder: string[]
) =>
  fallbackOrder
    .concat(Object.keys(localizedString))
    .find((lang) => Boolean(localizedString[lang]));

export type FormatLocalizedStringOptions<T> = {
  key: keyof T;
  locale: string | null;
  fallbackOrder?: string[];
  fallback?: string;
};

export const getPrimaryLocale = (locale: string): string =>
  locale.split('-')[0];

export const formatLocalizedFallbackHint = (
  value: string,
  locale: string
): string => `${value} (${locale.toUpperCase()})`;

export const formatLocalizedString = (
  localizedString: LocalizedString,
  locale: string | null,
  fallbackOrder: string[],
  fallback?: string
) => {
  const fallbackLocale = findFallbackLocale(localizedString, fallbackOrder);

  const formattedLocalizedFallback = fallbackLocale
    ? formatLocalizedFallbackHint(
        localizedString[fallbackLocale],
        fallbackLocale
      )
    : fallback;

  // GIVEN no `locale`
  // THEN return formattedFallback by fallbackOrder
  if (!locale) {
    return formattedLocalizedFallback;
  }

  // GIVEN locale
  // AND there is a value on `localizedString`
  // THEN return value
  if (localizedString[locale]) {
    return localizedString[locale];
  }

  // GIVEN locale
  // AND there is a value on primary locale
  // THEN return value on primary locale
  const primaryLocale = locale && getPrimaryLocale(locale);
  if (localizedString[primaryLocale]) {
    return localizedString[primaryLocale];
  }

  // use formattedFallback by fallbackOrder as last resort
  return formattedLocalizedFallback;
};
