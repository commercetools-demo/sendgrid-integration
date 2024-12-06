import { FC } from 'react';
import {
  TabHeader,
  TabularMainPage,
  useModalState,
} from '@commercetools-frontend/application-components';
import { FormattedMessage, useIntl } from 'react-intl';
import messages from './messages';
import { formatLocalizedString } from '@commercetools-frontend/l10n';
import { useCustomViewContext } from '@commercetools-frontend/application-shell-connectors';
import {
  useCustomObjectsFetcher,
  useCustomObjectUpdater,
} from '../../hooks/use-custom-object-connector/use-custom-object-connector';
import { ContentNotification } from '@commercetools-uikit/notifications';
import { castValue, getErrorMessage } from '../../helpers';
import LoadingSpinner from '@commercetools-uikit/loading-spinner';
import Spacings from '@commercetools-uikit/spacings';
import Text from '@commercetools-uikit/text';
import { useShowNotification } from '@commercetools-frontend/actions-global';
import {
  DOMAINS,
  NO_VALUE_FALLBACK,
  NOTIFICATION_KINDS_SIDE,
} from '@commercetools-frontend/constants';
import SecondaryButton from '@commercetools-uikit/secondary-button';
import { PlusBoldIcon } from '@commercetools-uikit/icons';
import LocalizationCreate from '../localization-create/localization-create';
import { Route, Switch, useRouteMatch } from 'react-router';
import LocalizationForm from '../localization-form/localization-form';
import { Localization } from '../../types';

export type Props = {};

export const CONTAINER_KEY = 'localizations';
const LocalizationOverview: FC<Props> = ({}) => {
  const intl = useIntl();
  const { projectLanguages, dataLocale } = useCustomViewContext((context) => ({
    projectLanguages: context.project?.languages ?? [],
    dataLocale: context.dataLocale ?? '',
  }));
  const showNotification = useShowNotification();
  const customObjectUpdater = useCustomObjectUpdater();
  const { customObjectsPaginatedResult, loading, error, refetch } =
    useCustomObjectsFetcher({ container: CONTAINER_KEY });
  const confirmationModalState = useModalState();
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

  const onSubmit = async (
    customObjectKey: string,
    customObjectName: Record<string, string>
  ) => {
    const value: Localization = {};
    if (
      Object.values(customObjectKey).filter((value) => value.length > 0)
        .length > 0
    ) {
      value.name = customObjectName;
    }
    await customObjectUpdater.execute({
      draft: {
        container: CONTAINER_KEY,
        key: customObjectKey,
        value: JSON.stringify(value),
      },
      onCompleted() {
        confirmationModalState.closeModal();
        showNotification({
          kind: NOTIFICATION_KINDS_SIDE.success,
          domain: DOMAINS.SIDE,
          text: intl.formatMessage(messages.editSuccess),
        });
      },
      onError(message) {
        showNotification({
          kind: NOTIFICATION_KINDS_SIDE.error,
          domain: DOMAINS.SIDE,
          text: intl.formatMessage(messages.editError, { message: message }),
        });

        refetch();
      },
    });
    await refetch();
  };

  return (
    <TabularMainPage
      customTitleRow={
        <Spacings.Inline justifyContent="space-between">
          <Text.Headline as="h2">
            {intl.formatMessage(messages.title)}
          </Text.Headline>

          <SecondaryButton
            iconLeft={<PlusBoldIcon />}
            onClick={() => confirmationModalState.openModal()}
            label={intl.formatMessage(messages.configurationAdd)}
          />
        </Spacings.Inline>
      }
      subtitle={intl.formatMessage(messages.subTitle)}
      tabControls={customObjectsPaginatedResult?.results?.map(
        (entry, index) => {
          let name = entry.key;
          const castedValue = castValue(entry);
          if (castedValue.name) {
            name = formatLocalizedString(
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
          }
          return (
            <TabHeader
              key={entry.key}
              to={`${match.url}${index === 0 ? '' : '/' + entry.key}`}
              label={name}
              exactPathMatch={true}
            />
          );
        }
      )}
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
          <Switch>
            {customObjectsPaginatedResult?.results?.map((item, index) => {
              const path: Array<string> = [`${match.path}/${item.key}`];
              if (index === 0) {
                path.push(match.path);
              }
              return (
                <Route key={item.key} path={path} exact={true}>
                  <LocalizationForm customObjectKey={item.key} />
                </Route>
              );
            })}
            <Route path={[match.path]} exact={true}>
              asd
            </Route>
          </Switch>
        )}

      <LocalizationCreate
        modalState={confirmationModalState}
        onSubmit={onSubmit}
      />
    </TabularMainPage>
  );
};

export default LocalizationOverview;
