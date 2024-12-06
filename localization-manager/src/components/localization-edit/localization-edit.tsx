import { FC, useCallback } from 'react';
import LocalizationForm from '../localization-form/localization-form';
import {
  CustomFormModalPage,
  PageNotFound,
} from '@commercetools-frontend/application-components';
import { useIntl } from 'react-intl';
import { useIsAuthorized } from '@commercetools-frontend/permissions';
import { PERMISSIONS } from '../../constants';
import { useParams } from 'react-router';
import messages from './messages';
import { useShowNotification } from '@commercetools-frontend/actions-global';
import {
  useCustomObjectDeleter,
  useCustomObjectFetcher,
  useCustomObjectUpdater,
} from '../../hooks/use-custom-object-connector/use-custom-object-connector';
import { CONTAINER_KEY } from '../localization-overview/localization-overview';
import { Localizations } from '../../types';
import {
  DOMAINS,
  NOTIFICATION_KINDS_SIDE,
} from '@commercetools-frontend/constants';
import { ContentNotification } from '@commercetools-uikit/notifications';
import { castValue, getErrorMessage } from '../../helpers';
import LoadingSpinner from '@commercetools-uikit/loading-spinner';
import Spacings from '@commercetools-uikit/spacings';
import Text from '@commercetools-uikit/text';
import LocalizedTextInput from '@commercetools-uikit/localized-text-input';
import { useApplicationContext } from '@commercetools-frontend/application-shell-connectors';

export type Props = { linkToHome: string; onClose: () => void };

const LocalizationEdit: FC<Props> = ({ onClose }) => {
  const intl = useIntl();
  const { id } = useParams<{ id: string }>();
  const canManage = useIsAuthorized({
    demandedPermissions: [PERMISSIONS.Manage],
  });
  const showNotification = useShowNotification();
  const { projectLanguages } = useApplicationContext((context) => ({
    projectLanguages: context.project?.languages ?? [],
  }));

  const { customObject, loading, error, refetch } = useCustomObjectFetcher({
    id: id,
  });
  const customObjectUpdater = useCustomObjectUpdater();
  const customObjectDeleter = useCustomObjectDeleter();

  const handleSubmit = useCallback(async (formikValues: Localizations) => {
    const { key, ...rest } = formikValues;
    await customObjectUpdater.execute({
      draft: {
        container: CONTAINER_KEY,
        key: key,
        value: JSON.stringify(rest),
      },
      onCompleted() {
        showNotification({
          kind: NOTIFICATION_KINDS_SIDE.success,
          domain: DOMAINS.SIDE,
          text: intl.formatMessage(messages.editSuccess),
        });
        onClose();
      },
      onError(message) {
        showNotification({
          kind: NOTIFICATION_KINDS_SIDE.error,
          domain: DOMAINS.SIDE,
          text: intl.formatMessage(messages.editError, { message: message }),
        });
      },
    });
    refetch();
  }, []);

  const handleDelete = async () => {
    await customObjectDeleter.execute({
      container: customObject?.container,
      key: customObject?.key,

      onCompleted: () => {
        showNotification({
          kind: NOTIFICATION_KINDS_SIDE.success,
          domain: DOMAINS.SIDE,
          text: intl.formatMessage(messages.editSuccess),
        });
        onClose();
      },
      onError: (message) => {
        showNotification({
          kind: NOTIFICATION_KINDS_SIDE.error,
          domain: DOMAINS.SIDE,
          text: intl.formatMessage(messages.editError, { message: message }),
        });
      },
    });
  };

  if (error) {
    return (
      <ContentNotification type="error">
        <Text.Body>{getErrorMessage(error)}</Text.Body>
      </ContentNotification>
    );
  }
  if (loading) {
    return (
      <Spacings.Stack alignItems="center">
        <LoadingSpinner />
      </Spacings.Stack>
    );
  }
  if (!customObject) {
    return <PageNotFound />;
  }

  const casted = castValue(customObject);
  return (
    <LocalizationForm
      initialValues={{
        ...casted,
        key: customObject.key,
        name: LocalizedTextInput.createLocalizedString(
          projectLanguages,
          casted.name ?? {}
        ),
        entries: casted.entries || [],
      }}
      onSubmit={handleSubmit}
    >
      {(formProps) => {
        return (
          <CustomFormModalPage
            isOpen
            title={intl.formatMessage(messages.title)}
            onClose={onClose}
            formControls={
              <>
                <CustomFormModalPage.FormSecondaryButton
                  label={CustomFormModalPage.Intl.revert}
                  isDisabled={!formProps.isDirty}
                  onClick={formProps.handleReset}
                />
                <CustomFormModalPage.FormPrimaryButton
                  isDisabled={
                    formProps.isSubmitting || !formProps.isDirty || !canManage
                  }
                  onClick={() => formProps.submitForm()}
                  label={CustomFormModalPage.Intl.save}
                />
                <CustomFormModalPage.FormDeleteButton
                  onClick={() => handleDelete()}
                />
              </>
            }
          >
            {formProps.formElements}
          </CustomFormModalPage>
        );
      }}
    </LocalizationForm>
  );
};

export default LocalizationEdit;
