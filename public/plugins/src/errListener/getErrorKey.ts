import { ErrorType } from './static';

export const getErrorKey = (event: ErrorEvent | Event): string => {
  const isJsError = event instanceof ErrorEvent;
  if (!isJsError) return ErrorType.RS;

  return event.message === 'Script error.' ? ErrorType.CS : ErrorType.JS;
};
