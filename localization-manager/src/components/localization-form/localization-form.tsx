import { FC, ReactElement } from 'react';
import Spacings from '@commercetools-uikit/spacings';
import { PageContentWide } from '@commercetools-frontend/application-components';
import { Localizations } from '../../types';
import { FieldArray, FormikHelpers, FormikProvider, useFormik } from 'formik';
import omitEmpty from 'omit-empty-es';
import LocalizedTextField from '@commercetools-uikit/localized-text-field';
import messages from './messages';
import { FormattedMessage, useIntl } from 'react-intl';
import { useApplicationContext } from '@commercetools-frontend/application-shell-connectors';
import TextField from '@commercetools-uikit/text-field';
import LocalizedTextInput from '@commercetools-uikit/localized-text-input';
import SecondaryButton from '@commercetools-uikit/secondary-button';
import { PlusThinIcon } from '@commercetools-uikit/icons';
import { transformLocalizedFieldToLocalizedString } from '@commercetools-frontend/l10n';
import LocalizationFormFields from '../localization-form-fields/localization-form-fields';
type Formik = ReturnType<typeof useFormik<Localizations>>;

type FormProps = {
  formElements: ReactElement;
  values: Formik['values'];
  isDirty: Formik['dirty'];
  isSubmitting: Formik['isSubmitting'];
  submitForm: Formik['handleSubmit'];
  handleReset: Formik['handleReset'];
};
export type Props = {
  children: (formProps: FormProps) => JSX.Element;
  initialValues: Localizations;
  onSubmit: (
    values: Localizations,
    formikHelpers: FormikHelpers<Localizations>
  ) => void | Promise<unknown>;
  createNewMode?: boolean;
};

type TErrors = {
  key: { missing?: boolean; invalidInput?: boolean; keyHint?: boolean };
  name: { missing?: boolean };
};

const validate = (formikValues: Localizations) => {
  const errors: TErrors = {
    key: {},
    name: {},
  };

  if (formikValues.key && formikValues.key.length > 0) {
    const keyValue = formikValues.key.trim();
    const keyLength = keyValue.length;
    if (keyLength < 2 || keyLength > 256 || !/^[a-zA-Z0-9-_]+$/.test(keyValue))
      errors.key.invalidInput = true;
  } else {
    errors.key.missing = true;
  }

  if (LocalizedTextInput.isEmpty(formikValues.name)) {
    errors.name.missing = true;
  }
  return omitEmpty<TErrors>(errors);
};

export const renderKeyInputErrors = (key: string) => {
  switch (key) {
    case 'invalidInput':
      return <FormattedMessage {...messages.invalidKey} />;
    case 'duplicate':
      return <FormattedMessage {...messages.duplicateKey} />;
    case 'missing':
      return <FormattedMessage {...messages.requiredKey} />;
    default:
      return null;
  }
};

const LocalizationForm: FC<Props> = ({
  children,
  initialValues,
  onSubmit,
  createNewMode = false,
}) => {
  const formik = useFormik<Localizations>({
    initialValues: initialValues,
    onSubmit: onSubmit,
    validate,
    enableReinitialize: true,
  });
  const intl = useIntl();
  // const showNotification = useShowNotification();
  const { dataLocale, projectLanguages } = useApplicationContext((context) => ({
    dataLocale: context.dataLocale ?? '',
    projectLanguages: context.project?.languages ?? [],
  }));

  const formElements = (
    <PageContentWide>
      <Spacings.Stack scale="xxxl">
        <Spacings.Stack scale="m">
          <FormikProvider value={formik}>
            <Spacings.Stack scale="m">
              <TextField
                name="key"
                value={formik.values.key}
                title={intl.formatMessage(messages.keyTitle)}
                isRequired
                errors={
                  TextField.toFieldErrors<Localizations>(formik.errors).key
                }
                touched={!!formik.touched.key}
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
                renderError={renderKeyInputErrors}
                isReadOnly={!createNewMode}
              />
              <LocalizedTextField
                name="name"
                selectedLanguage={dataLocale}
                value={formik.values.name || {}}
                title={intl.formatMessage(messages.nameTitle)}
                isRequired
                errors={
                  LocalizedTextField.toFieldErrors<Localizations>(formik.errors)
                    .name
                }
                touched={!!formik.touched.name}
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
              />
              <FieldArray name="entries">
                {({ remove, push }) => {
                  return (
                    <Spacings.Stack scale={'m'}>
                      {(formik.values.entries?.length || 0) > 0 &&
                        formik.values.entries?.map((entry, index) => {
                          return (
                            <LocalizationFormFields
                              key={index}
                              index={index}
                              remove={remove}
                              initialValues={entry}
                              onChange={formik.handleChange}
                              onBlur={formik.handleBlur}
                              propertyPath={'entries'}
                            />
                          );
                        })}
                      <Spacings.Inline scale={'s'}>
                        <SecondaryButton
                          iconLeft={<PlusThinIcon />}
                          label={intl.formatMessage(messages.configurationAdd)}
                          onClick={() =>
                            push({
                              key: '',
                              name: LocalizedTextInput.createLocalizedString(
                                projectLanguages,
                                transformLocalizedFieldToLocalizedString([]) ??
                                  {}
                              ),
                              values: [],
                            })
                          }
                        />
                      </Spacings.Inline>
                    </Spacings.Stack>
                  );
                }}
              </FieldArray>
              {/*{formik.values.entries &&*/}
              {/*  formik.values.entries.map((entry, i) => {*/}
              {/*    return (*/}
              {/*      <div key={i}>*/}
              {/*        <LocalizationFormFields*/}
              {/*          key={i}*/}
              {/*          initalValues={entry}*/}
              {/*          onSubmit={(data: Localization) => console.log(data)}*/}
              {/*        />*/}
              {/*      </div>*/}
              {/*    );*/}
              {/*  })}*/}
              {/*<LocalizationEntry formik={formik} />*/}
            </Spacings.Stack>
          </FormikProvider>
        </Spacings.Stack>
      </Spacings.Stack>
    </PageContentWide>
  );
  return children({
    formElements,
    values: formik.values,
    isDirty: formik.dirty,
    isSubmitting: formik.isSubmitting,
    submitForm: formik.handleSubmit,
    handleReset: formik.handleReset,
  });
};

export default LocalizationForm;
