import { GazeConfig } from 'types/gaze';
import { get, getKeys, has, set } from 'utils/reflect';
import { WebPerformanceObserver } from 'core/webPerformance';
import { UserBehaviorObserver } from 'core/userBehavior';
import { isObject } from './utils';

const mergeRecursive = (userConfig: any, initConfig: GazeConfig): GazeConfig =>
  getKeys(userConfig).reduce((prev, k) => {
    if (has(prev, k)) {
      const configItem = get(initConfig, k);
      set(
        prev,
        k,
        isObject(configItem)
          ? mergeRecursive(has(userConfig, k) ? get(userConfig, k) : {}, configItem)
          : get(userConfig, k)
      );
    }

    return prev;
  }, initConfig);

const mergeConfig = (userConfig: any): GazeConfig =>
  mergeRecursive(
    userConfig,
    // default config
    {
      target: 'http://localhost:9000',
      token: '',
      release: '',
      performance: {
        uploadImmediately: true,
        duration: 5000
      },
      error: {
        uploadImmediately: true,
        duration: 5000,
        logErrors: false,
        stackLimit: 10
      },
      behavior: {
        uploadImmediately: true,
        duration: 5000
      }
    }
  );

export class Gaze {
  static init(config: GazeConfig) {
    const mergedConfig = mergeConfig(config);
    const { performance, error, behavior } = mergedConfig;

    new WebPerformanceObserver(performance!).init();
    new UserBehaviorObserver(behavior!).init();
    // TODO
  }
}
