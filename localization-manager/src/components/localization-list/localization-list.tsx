import { FC } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { useCustomViewContext } from '@commercetools-frontend/application-shell-connectors';
import { useCustomObjectsFetcher } from '../../hooks/use-custom-object-connector/use-custom-object-connector';
import { InfoMainPage } from '@commercetools-frontend/application-components';
import { Switch, useHistory, useRouteMatch } from 'react-router';
import { ContentNotification } from '@commercetools-uikit/notifications';
import Text from '@commercetools-uikit/text';
import { castValue, getErrorMessage } from '../../helpers';
import Spacings from '@commercetools-uikit/spacings';
import LoadingSpinner from '@commercetools-uikit/loading-spinner';
import { NO_VALUE_FALLBACK } from '@commercetools-frontend/constants';
import messages from './messages';
import { CONTAINER_KEY } from '../localization-overview/localization-overview';
import SecondaryButton from '@commercetools-uikit/secondary-button';
import { PlusBoldIcon } from '@commercetools-uikit/icons';
import DataTable, { TDataTableProps } from '@commercetools-uikit/data-table';
import { formatLocalizedString } from '@commercetools-frontend/l10n';
import { TCustomObject } from '../../types/generated/ctp';
import LocalizationCreate from '../localization-create/localization-create';
import { SuspendedRoute } from '@commercetools-frontend/application-shell';
import LocalizationEdit from '../localization-edit/localization-edit';
import { Link } from 'react-router-dom';

export type Props = {};

const LocalizationList: FC<Props> = ({}) => {
  const intl = useIntl();
  const { push } = useHistory();
  const { projectLanguages, dataLocale } = useCustomViewContext((context) => ({
    projectLanguages: context.project?.languages ?? [],
    dataLocale: context.dataLocale ?? '',
  }));
  // const showNotification = useShowNotification();
  // const customObjectUpdater = useCustomObjectUpdater();
  const { customObjectsPaginatedResult, loading, error, refetch } =
    useCustomObjectsFetcher({ container: CONTAINER_KEY });
  // const confirmationModalState = useModalState();
  const match = useRouteMatch();

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

  // const onSubmit = async (
  //   customObjectKey: string,
  //   customObjectName: Record<string, string>
  // ) => {
  //   const value: Localization = {};
  //   if (
  //     Object.values(customObjectKey).filter((value) => value.length > 0)
  //       .length > 0
  //   ) {
  //     value.name = customObjectName;
  //   }
  //   await customObjectUpdater.execute({
  //     draft: {
  //       container: CONTAINER_KEY,
  //       key: customObjectKey,
  //       value: JSON.stringify(value),
  //     },
  //     onCompleted() {
  //       confirmationModalState.closeModal();
  //       showNotification({
  //         kind: NOTIFICATION_KINDS_SIDE.success,
  //         domain: DOMAINS.SIDE,
  //         text: intl.formatMessage(messages.editSuccess),
  //       });
  //     },
  //     onError(message) {
  //       showNotification({
  //         kind: NOTIFICATION_KINDS_SIDE.error,
  //         domain: DOMAINS.SIDE,
  //         text: intl.formatMessage(messages.editError, { message: message }),
  //       });
  //
  //       refetch();
  //     },
  //   });
  //   await refetch();
  // };
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

  const itemRenderer: TDataTableProps<TCustomObject>['itemRenderer'] = (
    item,
    column
  ) => {
    const castedValue = castValue(item);
    switch (column.key) {
      case 'key':
        return item[column.key];
      case 'name':
        return formatLocalizedString(
          {
            name: castedValue.name,
          },
          {
            key: 'name',
            locale: dataLocale,
            fallbackOrder: projectLanguages,
            fallback: NO_VALUE_FALLBACK,
          }
        );
      default:
        return '';
    }
  };

  const columns = [
    {
      key: 'key',
      label: intl.formatMessage(messages.columnTypeKey),
    },
    {
      key: 'name',
      label: intl.formatMessage(messages.columnTypeName),
    },
  ];

  return (
    <InfoMainPage
      customTitleRow={
        <Spacings.Inline justifyContent="space-between">
          <Text.Headline as="h2">
            {intl.formatMessage(messages.title)}
          </Text.Headline>

          <SecondaryButton
            as={Link}
            to={`${match.url}/new`}
            iconLeft={<PlusBoldIcon />}
            label={intl.formatMessage(messages.configurationAdd)}
          />
        </Spacings.Inline>
      }
      subtitle={intl.formatMessage(messages.subTitle)}
    >
      {(!customObjectsPaginatedResult ||
        customObjectsPaginatedResult.count <= 0) && (
        <Spacings.Stack alignItems={'flex-start'} scale={'m'}>
          <ContentNotification type="info">
            <Text.Body>
              <FormattedMessage {...messages.missingConfiguration} />
            </Text.Body>
          </ContentNotification>
        </Spacings.Stack>
      )}
      {customObjectsPaginatedResult &&
        customObjectsPaginatedResult.count > 0 && (
          <DataTable
            rows={customObjectsPaginatedResult?.results}
            columns={columns}
            itemRenderer={itemRenderer}
            onRowClick={(row) => push(`${match.url}/${row.id}`)}
          />
        )}
      <Switch>
        <SuspendedRoute path={`${match.path}/new`}>
          <LocalizationCreate
            linkToHome={match.url}
            onClose={() => {
              refetch();
              push(`${match.url}`);
            }}
          />
        </SuspendedRoute>
        <SuspendedRoute path={`${match.path}/:id`}>
          <LocalizationEdit
            onClose={() => {
              refetch();
              push(`${match.url}`);
            }}
            linkToHome={match.url}
          />
        </SuspendedRoute>
      </Switch>
    </InfoMainPage>
  );
};

export default LocalizationList;
