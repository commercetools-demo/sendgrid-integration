import { isApolloError, ApolloError, type ServerError } from '@apollo/client';
import { TCustomObject } from './types/generated/ctp';
import { Localization, Localizations } from './types';
import omitEmpty from 'omit-empty-es';

export const getErrorMessage = (error: ApolloError) =>
  error.graphQLErrors?.map((e) => e.message).join('\n') || error.message;

const isServerError = (
  error: ApolloError['networkError']
): error is ServerError => {
  return Boolean((error as ServerError)?.result);
};

export const extractErrorFromGraphQlResponse = (graphQlResponse: unknown) => {
  if (graphQlResponse instanceof Error && isApolloError(graphQlResponse)) {
    if (
      isServerError(graphQlResponse.networkError) &&
      typeof graphQlResponse.networkError?.result !== 'string' &&
      graphQlResponse.networkError?.result?.errors.length > 0
    ) {
      return graphQlResponse?.networkError?.result.errors;
    }

    if (graphQlResponse.graphQLErrors?.length > 0) {
      return graphQlResponse.graphQLErrors;
    }
  }

  return graphQlResponse;
};

export const castValue = (customObject: TCustomObject): Localizations => {
  return customObject.value as Localizations;
};

type TransformedErrors = {
  unmappedErrors: unknown[];
  formErrors: Record<string, { duplicate: boolean }>;
};

export const transformErrors = (graphQlErrors: unknown): TransformedErrors => {
  const errorsToMap = Array.isArray(graphQlErrors)
    ? graphQlErrors
    : [graphQlErrors];

  const { formErrors, unmappedErrors } = errorsToMap.reduce<TransformedErrors>(
    (transformedErrors, graphQlError) => {
      // const errorCode = graphQlError?.extensions?.code ?? graphQlError.code;
      // const fieldName = graphQlError?.extensions?.field ?? graphQlError.field;

      // if (errorCode === DUPLICATE_FIELD_ERROR_CODE) {
      //   transformedErrors.formErrors[fieldName] = { duplicate: true };
      // } else {
      transformedErrors.unmappedErrors.push(graphQlError);
      // }
      return transformedErrors;
    },
    {
      formErrors: {}, // will be mappped to form field error messages
      unmappedErrors: [], // will result in dispatching `showApiErrorNotification`
    }
  );

  return {
    formErrors: omitEmpty(formErrors),
    unmappedErrors,
  };
};
