import { EventType } from 'core/static';
import { ErrorType } from '../static';
import { ErrorInfo, uid } from '../types/errorInfo';
import { Uploader } from 'types/uploader';
import { createlistener, EventHandler, getNow } from 'utils/index';
import { getUid } from '../getUid';
import { Config } from '../types/config';
import { getErrorKey } from '../getErrorKey';
import { UploadTarget } from '../static';

const { erorrInfoTarget } = UploadTarget;

export const initCorsError = (options: Config, submitedErrorUids: Set<uid>, uploader: Uploader) => {
  const { logError } = options;

  const handler = (event: ErrorEvent) => {
    logError || event.preventDefault();

    if (getErrorKey(event) !== ErrorType.CS) return;

    const errorUid = getUid(`${ErrorType.CS}-${event.message}`);
    const info: ErrorInfo = {
      type: ErrorType.CS,
      errorUid,
      time: getNow(),
      message: event.message,
      detail: {
        tagName: ''
      }
    };

    if (!submitedErrorUids.has(errorUid)) {
      uploader(erorrInfoTarget, info);
      submitedErrorUids.add(errorUid);
    }
  };

  createlistener(EventType.error)(handler as EventHandler);
};
