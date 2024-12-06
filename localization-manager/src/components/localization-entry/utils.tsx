import { FormattedMessage } from 'react-intl';
import messages from './messages';

export function createColumnDefinitions(enumLanguages: Array<string>) {
  return [
    // key column
    {
      key: 'key',
      label: <FormattedMessage {...messages.tableHeaderLabelKey} />,
      isSortable: false,
    },
    // label column
    ...enumLanguages?.map((lang: string) => ({
      key: `label_${lang}`,
      label: (
        <FormattedMessage
          {...messages.tableHeaderLocalizedLabelLabel}
          values={{
            language: lang.toUpperCase(),
          }}
        />
      ),
      isSortable: false,
    })),
    // delete column
    {
      key: 'delete',
      width: 'max-content',
      label: '',
    },
  ];
}
