import {
  has,
  get,
  set,
  del,
  Plugin,
  HookCallback,
  Uploader,
  ErrorHandler
} from '@gaze-anchor/shared';
import { LifeCycleHookTypes } from '@gaze-anchor/static';

const { BEFORE_INSTALL, INSTALLED, BEFOR_UPLOAD, UPLOADED } = LifeCycleHookTypes;

const injectHook = (type: LifeCycleHookTypes, target: Plugin, hookCallback: HookCallback) => {
  if (!has(target, type)) {
    set(target, type, hookCallback);
  }
};

const createHook = (type: LifeCycleHookTypes, target: Plugin) => {
  return (hookCallback: HookCallback) => {
    injectHook(type, target, hookCallback);
  };
};

const getHooks = (target: Plugin) => {
  return {
    onInstalled: createHook(INSTALLED, target),
    onBeforeUpload: createHook(BEFOR_UPLOAD, target),
    onUploaded: createHook(UPLOADED, target)
  };
};

const triggerHook = (
  type: LifeCycleHookTypes,
  target: Plugin,
  once: boolean = true,
  param: Array<any> = []
) => {
  if (has(target, type)) {
    const hook: HookCallback<any> = get(target, type);
    once && del(target, type);

    if (typeof hook === 'function') {
      return hook(...param);
    }
  }
};

const proxyInstall = (target: Plugin) => {
  return new Proxy(target.install, {
    apply(fn, thisArg, args: Parameters<typeof target.install>) {
      const isContinue = triggerHook(BEFORE_INSTALL, target);
      // prevent install function from executing while the onBeforeInstall returned false
      if (isContinue !== false) {
        const res = fn.apply(thisArg, args);
        triggerHook(INSTALLED, target);
        return res;
      }

      return;
    }
  });
};
const proxyUploader = (target: Plugin, uploader: Uploader) => {
  return new Proxy(uploader, {
    apply(fn, thisArg, args: Parameters<Uploader>) {
      const isContinue = triggerHook(BEFOR_UPLOAD, target, false, args);
      // prevent upload function from executing while the onBeforeUpload returned false
      if (isContinue !== false) {
        const res = fn.apply(thisArg, args);
        triggerHook(UPLOADED, target, false);
        return res;
      }

      return;
    }
  });
};

export const initLifeCycle = (target: Plugin, uploader: Uploader) => {
  // the errorHandler is passed in from gaze
  // which is convenient for centralized management of error
  return (errorHandler: ErrorHandler) => {
    // proxy install function and call it
    proxyInstall(target)(
      // get proxyed uploader
      proxyUploader(target, uploader),
      errorHandler,
      // get hooks which had been bound to the context
      getHooks(target)
    );
  };
};
