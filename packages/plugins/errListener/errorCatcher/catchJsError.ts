import { EventType } from 'core/static';
import { ErrorType } from '../static';
import { ErrorInfo, StackParser, uid } from '../types/errorInfo';
import { Uploader } from 'types/uploader';
import { createlistener, EventHandler, getNow } from 'utils/index';
import { getErrorKey } from '../getErrorKey';
import { getUid } from '../getUid';
import { Config } from '../types/config';
import { UploadTarget } from '../static';

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
