import { defineMessages } from 'react-intl';

export default defineMessages<string>({
  title: {
    id: 'LocalizationManager.title',
    defaultMessage: 'Localization Manager',
  },
  subTitle: {
    id: 'LocalizationManager.subtitle',
    defaultMessage: 'Manage your localization bundles for external Apps here.',
  },
  configurationAdd: {
    id: 'LocalizationManager.configurationAdd',
    defaultMessage: 'Add new Entry',
  },
  editSuccess: {
    id: 'LocalizationManager.form.message.edit.success',
    defaultMessage: 'Your data has been saved.',
  },
  editError: {
    id: 'LocalizationManager.form.message.edit.error',
    defaultMessage:
      'Something went wrong. Your update was not saved. {message}',
  },
  createAndLink: {
    id: 'CustomizableProduct.createAndLink',
    defaultMessage:
      'Create and Link Custom Object to attribute with name "{attributeName}".',
  },
  missingConfiguration: {
    id: 'LocalizationManager.missingConfiguration',
    defaultMessage: 'No Localizations have been created so far.',
  },
});
