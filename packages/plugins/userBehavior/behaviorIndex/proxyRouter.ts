import { EventType } from 'core/static';
import { Uploader } from 'types/uploader';
import { set, getNow } from 'utils/index';
import { proxyForwardAndBackward, proxyRouterLink } from 'core/proxyRouter';
import { RouterChangeDetail, UserBehavior } from '../types/userBehavior';
import { UploadTarget, BehaviorType } from '../static';

const { userBehaviorTarget } = UploadTarget;

export const initRouterProxy = (upload: Uploader) => {
  const { routerChange } = BehaviorType;

  const handler = (e: Event) => {
    const { hash, pathname, href } = (e.target as Window).location;

    const detail: RouterChangeDetail = {
      method: hash ? 'Hash' : 'History',
      href
    };
    hash ? set(detail, 'hash', hash) : set(detail, 'pathname', pathname);

    const userBehavior: UserBehavior = {
      time: getNow(),
      value: {
        type: routerChange,
        page: href,
        time: getNow(),
        detail
      }
    };

    upload(userBehaviorTarget, userBehavior);
  };

  // called when routing is switched
  proxyRouterLink([EventType.pushState], handler);
  // called when click the forward and backward buttons
  proxyForwardAndBackward([EventType.popState], handler);
};
