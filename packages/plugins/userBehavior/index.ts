import { initPV, initRouterProxy, initHttpProxy, initOperationListener } from './behaviorIndex';
import { PluginDefineFunction } from 'types/plugin';

export const userBehaviorObserverPlugin: PluginDefineFunction<null> = () => {
  return {
    install(uploader) {
      console.log('install userBehavior!');

      initPV(uploader);
      initRouterProxy(uploader);
      initHttpProxy(uploader);
      initOperationListener(uploader);
    }
  };
};
