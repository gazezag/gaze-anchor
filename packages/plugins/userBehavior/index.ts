import { initPV, initRouterProxy, initHttpProxy, initOperationListener } from './behaviorIndex';
import { PluginDefineFunction } from 'types/plugin';

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
