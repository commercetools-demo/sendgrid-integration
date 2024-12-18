export type Message = {
  code: string;
  message: string;
  referencedBy: string;
};

export type ValidatorCreator = (
  path: string[],
  message: Message,
  overrideConfig?: object
) => [string[], [[(o: object) => boolean, string, [object]]]];

export type ValidatorFunction = (o: object) => boolean;

export type Wrapper = (
  validator: ValidatorFunction
) => (value: object) => boolean;

export type HandlerReturnType = {
  recipientEmailAddresses: Array<string | undefined>;
  templateId: string;
  templateData: Record<string, any>;
  preSuccessMessage: string;
  successMessage: string;
  locale: string;
};

export type HandlerType<T> = (
  messageBody: T,
  languages: Array<string>
) => Promise<HandlerReturnType | undefined>;
