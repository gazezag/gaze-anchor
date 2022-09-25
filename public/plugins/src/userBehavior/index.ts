import { PluginDefineFunction } from '@gaze-anchor/shared-types';
import { initPV, initRouterProxy, initHttpProxy, initOperationListener } from './behaviorIndex';

export const userBehaviorObserverPlugin: PluginDefineFunction<null> = () => {
  return {
    install(uploader) {
      initPV(uploader);
      initRouterProxy(uploader);
      initHttpProxy(uploader);
      initOperationListener(uploader);
    }
  };
};
