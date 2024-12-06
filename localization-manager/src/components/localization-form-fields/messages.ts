import { defineMessages } from 'react-intl';

export default defineMessages({
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
});
