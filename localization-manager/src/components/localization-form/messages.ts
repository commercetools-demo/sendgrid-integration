import { defineMessages } from 'react-intl';

export default defineMessages({
  editSuccess: {
    id: 'RowDetails.form.message.edit.success',
    defaultMessage: 'Your row update has been saved.',
  },
  editError: {
    id: 'RowDetails.form.message.edit.error',
    defaultMessage:
      'Something went wrong. Your change was not saved. {message}',
  },
  nameTitle: {
    id: 'LocalizationAdd.form.name.title',
    defaultMessage: 'Name',
  },
  keyTitle: {
    id: 'LocalizationAdd.form.key.title',
    defaultMessage: 'Key',
  },
  keyHint: {
    id: 'LocalizationAdd.form.key.hint',
    defaultMessage:
      'May only contain between 2 and 256 alphanumeric characters, underscores, or hyphens (no spaces or special characters like ñ, ü, #, %).',
  },
  duplicateKey: {
    id: 'LocalizationAdd.form.GeneralInfoForm.duplicateKey',
    defaultMessage: 'A subscription with this key already exists.',
  },
  requiredKey: {
    id: 'LocalizationAdd.form.GeneralInfoForm.requiredKey',
    defaultMessage: 'This field is required. Provide at least one value.',
  },
  invalidKey: {
    id: 'LocalizationAdd.form.GeneralInfoForm.invalidKey',
    defaultMessage:
      'Key must contain between 2 and 256 alphanumeric characters, underscores and/or hyphens',
  },
  configurationAdd: {
    id: 'LocalizationManager.configurationAdd',
    defaultMessage: 'Add new Entry',
  },
});
