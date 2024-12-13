import { LocalizedString } from '@commercetools/platform-sdk';
import { getCustomObjectByContainerAndKey } from '../ctp/custom-objects';
import { logger } from './logger.utils';
import * as defaultLocalizations from './localizations.json';

export const findFallbackLocale = (
  localizedString: LocalizedString,
  fallbackOrder: string[]
) =>
  fallbackOrder
    .concat(Object.keys(localizedString))
    .find((lang) => Boolean(localizedString[lang]));

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

export const loadAdditionalLocalizations = async (
  key: string,
  locale: string,
  fallbackOrder: string[],
  dynamic = true
) => {
  let additionalConfig = defaultLocalizations as {
    name: Record<string, string>;
    entries: Array<{
      key: string;
      name: Record<string, string>;
      values: Array<{
        key: string;
        label: Record<string, string>;
      }>;
    }>;
  };
  if (dynamic) {
    try {
      const localizations = await getCustomObjectByContainerAndKey(
        'localizations',
        'transactional-emails'
      );
      additionalConfig = localizations.value;
      logger.info('Found localizations:', JSON.stringify(localizations));
    } catch (e) {
      logger.info('No Localizations found in custom object');
    }
  }
  const config = additionalConfig.entries.find((entry) => entry.key === key);
  if (!config) {
    logger.info(`No Localization config found for key ${key}`);
    return undefined;
  }
  logger.info(`Found localizations for ${key}:`, JSON.stringify(config));
  return config.values.reduce(
    (acc, current) => ({
      ...acc,
      [current.key]: formatLocalizedString(
        current.label,
        locale,
        fallbackOrder
      ),
    }),
    {}
  );
};
