import { defineMessages } from 'react-intl';

export default defineMessages({
  title: {
    id: 'EditType.title',
    description: 'The page title of create type',
    defaultMessage: 'Edit Entry',
  },
  editSuccess: {
    id: 'RowDetails.form.message.edit.success',
    defaultMessage: 'Your row update has been saved.',
  },
  editError: {
    id: 'RowDetails.form.message.edit.error',
    defaultMessage:
      'Something went wrong. Your change was not saved. {message}',
  },
});
