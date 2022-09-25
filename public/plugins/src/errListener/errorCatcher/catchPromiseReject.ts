import { EventType } from 'static';
import { Uploader } from 'shared-types';
import { isEmpty, getNow, createlistener, EventHandler } from 'shared-utils';
import { getUid } from '../getUid';
import { Config } from '../types/config';
import { ErrorInfo, StackParser, uid } from '../types/errorInfo';
import { ErrorType, UploadTarget } from '../static';

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
