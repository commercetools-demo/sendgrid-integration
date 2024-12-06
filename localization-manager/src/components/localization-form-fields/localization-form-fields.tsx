import { type ChangeEventHandler, FC, type FocusEventHandler } from 'react';
import Spacings from '@commercetools-uikit/spacings';
import LocalizedTextField from '@commercetools-uikit/localized-text-field';
import messages from './messages';
import { useIntl } from 'react-intl';
import { useApplicationContext } from '@commercetools-frontend/application-shell-connectors';
import { Localization } from '../../types';
import { formatLocalizedString } from '@commercetools-frontend/l10n';
import CollapsiblePanel from '@commercetools-uikit/collapsible-panel';
import TextField from '@commercetools-uikit/text-field';
import { LocalizationEntry } from '../localization-entry/localization-entry';
import { CustomFormModalPage } from '@commercetools-frontend/application-components';

export type Props = {
  initialValues: Localization;
  // onSubmit: (values: Localization) => void;
  index: number;
  remove: (index: number) => void;
  onBlur?: FocusEventHandler<HTMLInputElement>;
  onChange?: ChangeEventHandler<HTMLInputElement>;
  propertyPath: 'entries';
};

const LocalizationFormFields: FC<Props> = ({
  remove,
  index,
  initialValues,
  onBlur,
  onChange,
  propertyPath,
}) => {
  const intl = useIntl();
  const { dataLocale, projectLanguages } = useApplicationContext((context) => ({
    dataLocale: context.dataLocale ?? '',
    projectLanguages: context.project?.languages ?? [],
  }));

  return (
    <CollapsiblePanel
      isDefaultClosed={!!initialValues.key}
      header={
        <CollapsiblePanel.Header>
          {/*<FormattedMessage {...messages.generalInformationTitle} />*/}
          {formatLocalizedString(
            {
              name: initialValues.name,
            },
            {
              key: 'name',
              locale: dataLocale,
              fallbackOrder: projectLanguages,
              fallback: initialValues.key,
            }
          )}
        </CollapsiblePanel.Header>
      }
      headerControls={
        <CustomFormModalPage.FormDeleteButton onClick={() => remove(index)} />
      }
    >
      <Spacings.Stack scale="m">
        <TextField
          name={`${propertyPath}.${index}.key`}
          value={initialValues.key}
          title={intl.formatMessage(messages.keyTitle)}
          isRequired
          // errors={TextField.toFieldErrors<Localizations>(formik.errors).key}
          // touched={!!formik.touched.key}
          onBlur={onBlur}
          onChange={onChange}
          // renderError={renderKeyInputErrors}
          // isReadOnly={!createNewMode}
        />
        <LocalizedTextField
          name={`${propertyPath}.${index}.name`}
          selectedLanguage={dataLocale}
          value={initialValues.name || {}}
          title={intl.formatMessage(messages.nameTitle)}
          isRequired
          // errors={
          //   LocalizedTextField.toFieldErrors<Localization>(formik.errors).name
          // }
          // touched={!!formik.touched.name}
          onBlur={onBlur}
          onChange={onChange}
        />
        <LocalizationEntry
          propertyPathParent={propertyPath}
          propertyPathIndex={index}
          propertyName={'values'}
        />
      </Spacings.Stack>
    </CollapsiblePanel>
  );
};

export default LocalizationFormFields;
