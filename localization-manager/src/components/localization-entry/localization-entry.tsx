import Spacings from '@commercetools-uikit/spacings';
import { useFormikContext } from 'formik';
import { FC } from 'react';
import FieldLabel from '@commercetools-uikit/field-label';
import { FormattedMessage } from 'react-intl';
import messages from './messages';
import { LocalizationEntryTable, Item } from './localization-entry-table';
import { Localizations } from '../../types';

type Props = {
  propertyPathParent: 'entries';
  propertyPathIndex: number;
  propertyName: 'values';
};

export const LocalizationEntry: FC<Props> = ({
  propertyPathParent,
  propertyPathIndex,
  propertyName,
}) => {
  const formik = useFormikContext<Localizations>();
  const handleAddEnumValue = (enumTemplate: Item) => {
    const enumDraftItemIndexes =
      formik.values.entries?.[propertyPathIndex].values?.length || 0;
    formik.setFieldValue(
      `${propertyPathParent}.${propertyPathIndex}.${propertyName}.${enumDraftItemIndexes}`,
      enumTemplate
    );
  };

  const handleRemoveEnumValue = async (absoluteIndex: number) => {
    if (
      formik.values.entries?.[propertyPathIndex].values &&
      formik.values.entries?.[propertyPathIndex].values[absoluteIndex]
    ) {
      const nextEnumDraftItems = [
        ...formik.values.entries?.[propertyPathIndex].values,
      ];

      nextEnumDraftItems.splice(absoluteIndex, 1);

      await formik.setFieldValue(
        `${propertyPathParent}.${propertyPathIndex}.${propertyName}`,
        nextEnumDraftItems,
        false
      );
    }
  };

  const handleChangeEnumValue = async ({
    field,
    nextValue,
    absoluteIndex,
  }: {
    field: string;
    nextValue: string;
    absoluteIndex: number;
  }) => {
    // if this is the first change, create the draft within the changes
    if (
      !formik.values.entries?.[propertyPathIndex].values ||
      !formik.values.entries?.[propertyPathIndex].values[absoluteIndex]
    ) {
      await formik.setFieldValue(
        `${propertyPathParent}.${propertyPathIndex}.${propertyName}.${absoluteIndex}`,
        {
          key: '',
          label: undefined,
        }
      );
    }
    // `field` can be `key` or `label` (or `label.de` depending on the attribute being localized or not)
    await formik.setFieldValue(
      `${propertyPathParent}.${propertyPathIndex}.${propertyName}.${absoluteIndex}.${field}`,
      nextValue,
      false
    );
    await formik.setFieldTouched(
      `${propertyPathParent}.${propertyPathIndex}.${propertyName}.${absoluteIndex}.${field}`,
      true
    );
  };

  return (
    <Spacings.Stack scale="l" alignItems={'flex-start'}>
      <FieldLabel
        title={<FormattedMessage {...messages.attributeSettingsTitle} />}
      />
      <LocalizationEntryTable
        onAddEnumValue={handleAddEnumValue}
        onChangeEnumValue={handleChangeEnumValue}
        onRemoveEnumValue={handleRemoveEnumValue}
        propertyPathParent={propertyPathParent}
        propertyPathIndex={propertyPathIndex}
        propertyName={propertyName}
      />
    </Spacings.Stack>
  );
};
