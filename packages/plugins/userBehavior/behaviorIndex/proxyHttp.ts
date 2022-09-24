import { BehaviorType, UploadTarget } from '../static';
import { Uploader } from 'types/uploader';
import { UserBehavior } from '../types/userBehavior';
import { getNow } from 'utils/timestampHandler';
import { HttpDetail, ProxyCallback } from 'types/proxyNative';
import { proxyHttp } from 'core/proxyHttp';

const { userBehaviorTarget } = UploadTarget;

export const initHttpProxy = (upload: Uploader) => {
  const handler: ProxyCallback<HttpDetail> = httpDetail => {
    const { request } = BehaviorType;

    const userBehavior: UserBehavior = {
      time: getNow(),
      value: {
        type: request,
        page: window.location.pathname,
        time: getNow(),
        detail: httpDetail
      }
    };

    upload(userBehaviorTarget, userBehavior);
  };

  proxyHttp(handler);
};
