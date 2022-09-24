import { ErrorType } from '../static';
import { ErrorInfo, uid } from '../types/errorInfo';
import { Uploader } from 'types/uploader';
import { getNow } from 'utils/index';
import { getUid } from '../getUid';
import { UploadTarget } from '../static';
import { proxyHttp } from 'core/proxyHttp';
import { ProxyCallback } from 'types/proxyNative';
import { HttpDetail } from 'types/proxyNative';

const { erorrInfoTarget } = UploadTarget;

export const initHttpError = (submitedErrorUids: Set<uid>, uploader: Uploader) => {
  const handler: ProxyCallback<HttpDetail> = httpDetail => {
    // TODO
    if (httpDetail.status < 400) return;

    const errorUid = getUid(`${ErrorType.RS}-${httpDetail.response}-${httpDetail.statusText}`);

    const info: ErrorInfo = {
      type: ErrorType.HP,
      errorUid,
      time: getNow(),
      message: httpDetail.response,
      detail: {
        status: httpDetail.status,
        response: httpDetail.response,
        statusText: httpDetail.statusText
      }
    };

    if (!submitedErrorUids.has(errorUid)) {
      uploader(erorrInfoTarget, info);
      submitedErrorUids.add(errorUid);
    }
  };

  proxyHttp(handler);
};
