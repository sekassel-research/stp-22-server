import { buildMessage, isDataURI, isURL, ValidateBy, ValidationOptions } from 'class-validator';

export function IsUrlOrUri(validationOptions?: ValidationOptions): PropertyDecorator {
  return ValidateBy(
    {
      name: 'isUrlOrUri',
      validator: {
        validate: value => isURL(value) || isDataURI(value),
        defaultMessage: buildMessage(eachPrefix => eachPrefix + '$property must be an URL address or Data URI', validationOptions),
      },
    },
    validationOptions,
  );
}
