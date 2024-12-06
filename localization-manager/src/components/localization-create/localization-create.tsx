import { FC, useCallback } from 'react';
import { FormModalPage } from '@commercetools-frontend/application-components';
import messages from './messages';
import { useIntl } from 'react-intl';
import LocalizationForm from '../localization-form/localization-form';
import { useIsAuthorized } from '@commercetools-frontend/permissions';
import { PERMISSIONS } from '../../constants';
import { useCustomObjectUpdater } from '../../hooks/use-custom-object-connector/use-custom-object-connector';
import {
  showApiErrorNotification,
  TApiErrorNotificationOptions,
  useShowNotification,
} from '@commercetools-frontend/actions-global';
import { DOMAINS } from '@commercetools-frontend/constants';
import { transformErrors } from '../../helpers';
import { Localizations } from '../../types';
import { CONTAINER_KEY } from '../localization-overview/localization-overview';
import LocalizedTextInput from '@commercetools-uikit/localized-text-input';
import { transformLocalizedFieldToLocalizedString } from '@commercetools-frontend/l10n';
import { useApplicationContext } from '@commercetools-frontend/application-shell-connectors';

export type Props = {
  linkToHome: string;
  onClose: () => void;
};

const LocalizationCreate: FC<Props> = ({ onClose }) => {
  const canManage = useIsAuthorized({
    demandedPermissions: [PERMISSIONS.Manage],
  });
  const { projectLanguages } = useApplicationContext((context) => ({
    projectLanguages: context.project?.languages ?? [],
  }));
  const intl = useIntl();
  const showNotification = useShowNotification();
  const customObjectUpdater = useCustomObjectUpdater();

  const handleSubmit = useCallback(
    async (formikValues: Localizations, formikHelpers) => {
      try {
        const { key, ...rest } = formikValues;
        await customObjectUpdater.execute({
          draft: {
            container: CONTAINER_KEY,
            key: key,
            value: JSON.stringify(rest),
          },
        });
        showNotification({
          kind: 'success',
          domain: DOMAINS.SIDE,
          text: intl.formatMessage(messages.createSuccess),
        });
        onClose();
      } catch (graphQLErrors) {
        const transformedErrors = transformErrors(graphQLErrors);
        if (transformedErrors.unmappedErrors.length > 0) {
          showApiErrorNotification({
            errors:
              transformedErrors.unmappedErrors as TApiErrorNotificationOptions['errors'],
          });
        }

        formikHelpers.setErrors(transformedErrors.formErrors);
      }
    },
    [intl]
  );
  return (
    <LocalizationForm
      initialValues={{
        key: '',
        name: LocalizedTextInput.createLocalizedString(
          projectLanguages,
          transformLocalizedFieldToLocalizedString([]) ?? {}
        ),
      }}
      onSubmit={handleSubmit}
      createNewMode={true}
    >
      {(formProps) => {
        return (
          <FormModalPage
            title={intl.formatMessage(messages.title)}
            isOpen
            onPrimaryButtonClick={() => formProps.submitForm()}
            onSecondaryButtonClick={onClose}
            hideControls={false}
            labelPrimaryButton={intl.formatMessage(FormModalPage.Intl.save)}
            isPrimaryButtonDisabled={
              formProps.isSubmitting || !formProps.isDirty || !canManage
            }
          >
            {formProps.formElements}
          </FormModalPage>
        );
      }}
    </LocalizationForm>
  );
};

export default LocalizationCreate;
