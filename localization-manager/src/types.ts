export type Localization = {
  key: string;
  name: Record<string, string>;
  values?: Array<{
    key: string;
    label: Record<string, string>;
  }>;
};

export type Localizations = {
  key: string;
  name?: Record<string, string>;
  entries?: Array<Localization>;
};
