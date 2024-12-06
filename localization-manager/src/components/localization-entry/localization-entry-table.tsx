import { useFormikContext } from 'formik';
import { FC, Fragment } from 'react';
import DataTable, { TRow } from '@commercetools-uikit/data-table';
import SecondaryButton from '@commercetools-uikit/secondary-button';
import { BinLinearIcon, PlusBoldIcon } from '@commercetools-uikit/icons';
import messages from './messages';
import { useIntl } from 'react-intl';
import memoize from 'memoize-one';
import { useCustomViewContext } from '@commercetools-frontend/application-shell-connectors';
import TextInput from '@commercetools-uikit/text-input';
import IconButton from '@commercetools-uikit/icon-button';
import { createColumnDefinitions } from './utils';
import { Localizations } from '../../types';

type LocalizedString = { [key: string]: string };

export type Item = {
  key?: string;
  label?: LocalizedString | string;
  absoluteIndex?: number;
};

type RowItem = { index: number } & Item & TRow;

const getLocalizedEnumLabel = (
  docLabel: LocalizedString,
  formColumnKey: string
) => {
  if (!docLabel) {
    return '';
  }
  return docLabel[formColumnKey.split('_')[1]] || '';
};
const formToDocLocalizedEnumLabel = (formColumnKey: string) =>
  formColumnKey.replace('_', '.');

const getLangsFromEnums = (enums: Array<Item>): Array<string> => {
  let map = enums
    .map((item) => {
      return item.label ? Object.keys(item.label) : [];
    })
    .flat();
  return Array.from(new Set(map));
};

export function sortEnumLanguagesByResourceLanguages(
  enumLanguages: Array<string>,
  resourceLanguages: Array<string>
) {
  return [
    ...resourceLanguages,
    ...enumLanguages?.filter((item) => !resourceLanguages.includes(item)),
  ];
}

const getEnumLanguages = memoize((values) => (languages: Array<string>) => {
  if (!values) {
    return languages;
  }
  return values?.length > 0
    ? sortEnumLanguagesByResourceLanguages(getLangsFromEnums(values), languages)
    : languages;
});
const createEmptyLocalizedEnum = (enumLanguages: Array<string>) => {
  return {
    key: '',
    ...enumLanguages.reduce<{
      label: Record<string, string>;
    }>((acc, lang) => ({ ...acc, label: { ...acc.label, [lang]: '' } }), {
      label: {},
    }),
  };
};

type Props = {
  onAddEnumValue: (item: Item) => void;
  onRemoveEnumValue: (absoluteIndex: number) => void;
  onChangeEnumValue: ({
    field,
    nextValue,
    absoluteIndex,
  }: {
    field: string;
    nextValue: string;
    absoluteIndex: number;
  }) => void;
  isDisabled?: boolean;
  isLocalized?: boolean;
  propertyPathParent: 'entries';
  propertyPathIndex: number;
  propertyName: 'values';
};

export const LocalizationEntryTable: FC<Props> = ({
  onAddEnumValue,
  onRemoveEnumValue,
  onChangeEnumValue,
  isDisabled,
  propertyPathParent,
  propertyPathIndex,
  propertyName,
}) => {
  const intl = useIntl();

  const formik = useFormikContext<Localizations>();
  const { projectLanguages } = useCustomViewContext((context) => ({
    projectLanguages: context.project?.languages ?? [],
  }));
  const handleAddEnumClick = () => {
    const enumLanguages = getEnumLanguages(
      formik.values[propertyPathParent]?.[propertyPathIndex][propertyName]
    )(projectLanguages || []);

    const newEnum = createEmptyLocalizedEnum(enumLanguages);
    onAddEnumValue(newEnum);
  };

  const items =
    !formik.values[propertyPathParent]?.[propertyPathIndex][propertyName] ||
    formik.values[propertyPathParent]?.[propertyPathIndex][propertyName]
      .length === 0
      ? [createEmptyLocalizedEnum(projectLanguages)]
      : formik.values[propertyPathParent]?.[propertyPathIndex][propertyName];
  const rows = items.map(
    (item, index): RowItem => ({
      ...item,
      id: index.toString(),
      absoluteIndex: index,
      index,
    })
  );

  const renderEnum = ({
    row,
    rows,
    key,
    onChangeEnumValue,
    isDisabled,
  }: {
    row: RowItem;
    rows: Array<Item>;
    key: string;
    onChangeEnumValue: ({
      field,
      nextValue,
      absoluteIndex,
    }: {
      field: string;
      nextValue: string;
      absoluteIndex: number;
    }) => void;
    isDisabled?: boolean;
  }) => {
    const nameAttribute = `enums.${row.index}.${key}`;
    const value = key.startsWith('label')
      ? getLocalizedEnumLabel(row.label as LocalizedString, key)
      : (row[key as keyof RowItem] as string) || '';
    switch (key) {
      case 'delete':
        return (
          <IconButton
            icon={<BinLinearIcon />}
            isDisabled={isDisabled || rows.length === 1}
            label="Delete List Item"
            size="30"
            onClick={() => onRemoveEnumValue(row.absoluteIndex || 0)}
          />
        );
      default:
        return (
          <Fragment>
            <TextInput
              value={value}
              name={nameAttribute}
              onChange={(event) => {
                onChangeEnumValue({
                  absoluteIndex: row.absoluteIndex || 0,
                  field: formToDocLocalizedEnumLabel(key),
                  nextValue: event.target.value,
                });
              }}
              isDisabled={isDisabled}
            />
          </Fragment>
        );
    }
  };
  return (
    <DataTable
      columns={createColumnDefinitions(
        getEnumLanguages(
          formik.values[propertyPathParent]?.[propertyPathIndex][propertyName]
        )(projectLanguages || [])
      )}
      rows={rows}
      itemRenderer={(row, { key }) =>
        renderEnum({
          rows: items,
          row,
          key,
          onChangeEnumValue: onChangeEnumValue,
          isDisabled: isDisabled,
        })
      }
      footer={
        <SecondaryButton
          iconLeft={<PlusBoldIcon />}
          label={intl.formatMessage(messages.addEnumButtonLabel)}
          onClick={handleAddEnumClick}
          isDisabled={isDisabled}
        />
      }
    ></DataTable>
  );
};
