import { EventType } from 'static';
import { createlistener, EventHandler, getNow } from 'shared-utils';
import { Uploader } from 'shared-types';
import { ErrorType, UploadTarget } from '../static';
import { ErrorInfo, StackParser, uid } from '../types/errorInfo';
import { getErrorKey } from '../getErrorKey';
import { getUid } from '../getUid';
import { Config } from '../types/config';

const { erorrInfoTarget } = UploadTarget;

export const initJsError = (
  options: Config,
  stackParser: StackParser,
  submitedErrorUids: Set<uid>,
  uploader: Uploader
) => {
  const { logError } = options;

  const handler = (event: ErrorEvent) => {
    logError || event.preventDefault();

    if (getErrorKey(event) !== ErrorType.JS) return;

    const errorUid = getUid(`${ErrorType.JS}-${event.message}-${event.filename}`);

    const info: ErrorInfo = {
      type: ErrorType.JS,
      errorUid,
      time: getNow(),
      message: event.message,
      detail: {
        type: event.error?.name || 'Unknwon',
        stackTrace: stackParser(event.error)
      }
    };

    if (!submitedErrorUids.has(errorUid)) {
      uploader(erorrInfoTarget, info);
      submitedErrorUids.add(errorUid);
    }
  };

  createlistener(EventType.error)(handler as EventHandler);
};
