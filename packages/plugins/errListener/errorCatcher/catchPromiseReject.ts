import { EventType } from 'core/static';
import { ErrorType } from '../static';
import { Uploader } from 'types/uploader';
import { createlistener, EventHandler } from 'utils/eventHandler';
import { isEmpty } from 'utils/reflect';
import { getNow } from 'utils/timestampHandler';
import { getUid } from '../getUid';
import { Config } from '../types/config';
import { ErrorInfo, StackParser, uid } from '../types/errorInfo';
import { UploadTarget } from '../static';

const { erorrInfoTarget } = UploadTarget;

export const initPromiseReject = (
  options: Config,
  stackParser: StackParser,
  submitedErrorUids: Set<uid>,
  uploader: Uploader
) => {
  const { logError } = options;

  const handler = (event: PromiseRejectionEvent) => {
    logError || event.preventDefault();

    const value = event.reason;
    const type = event.reason.name || 'UnKnowun';
    const errorUid = getUid(`${ErrorType.UJ}-${value}-${type}`);

    const info: ErrorInfo = {
      type: ErrorType.UJ,
      errorUid,
      time: getNow(),
      message: isEmpty(value) ? '' : value,
      detail: {
        type: isEmpty(event.reason) ? 'Unknwon' : event.reason,
        stackTrace: stackParser(event.reason)
      }
    };

    if (!submitedErrorUids.has(errorUid)) {
      uploader(erorrInfoTarget, info);
      submitedErrorUids.add(errorUid);
    }
  };

  createlistener(EventType.unhandledrejection)(handler as EventHandler);
};
