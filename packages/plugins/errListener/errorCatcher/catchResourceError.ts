import { EventType } from 'core/static';
import { ErrorType } from '../static';
import { ErrorInfo, ResourceErrorDetail, uid } from '../types/errorInfo';
import { Uploader } from 'types/uploader';
import { createlistener, EventHandler } from 'utils/eventHandler';
import { getNow } from 'utils/timestampHandler';
import { getErrorKey } from '../getErrorKey';
import { getUid } from '../getUid';
import { Config } from '../types/config';
import { UploadTarget } from '../static';

const { erorrInfoTarget } = UploadTarget;

export const initResourceError = (
  options: Config,
  submitedErrorUids: Set<uid>,
  uploader: Uploader
) => {
  const { logError } = options;

  const handler = (event: ErrorEvent) => {
    logError || event.preventDefault();

    if (getErrorKey(event) !== ErrorType.RS) return;
    const target = event.target as ResourceErrorDetail;
    const errorUid = getUid(`${ErrorType.RS}-${target.src}-${target.tagName}`);

    const info: ErrorInfo = {
      type: ErrorType.RS,
      errorUid,
      time: getNow(),
      message: '',
      detail: {
        type: event.error?.name || 'Unknwon',
        src: target.src,
        outerHTML: target.outerHTML,
        tagName: target.tagName
      }
    };

    if (!submitedErrorUids.has(errorUid)) {
      uploader(erorrInfoTarget, info);
      submitedErrorUids.add(errorUid);
    }
  };

  createlistener(EventType.error)(handler as EventHandler, true);
};
