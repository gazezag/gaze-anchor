import { Uploader } from '@gaze-anchor/shared-types';
import { getNow, HttpDetail, ProxyCallback, proxyHttp } from '@gaze-anchor/shared-utils';
import { UserBehavior } from '../types/userBehavior';
import { BehaviorType, UploadTarget } from '../static';

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
