import { GazeConfig } from 'types/gaze';
import { get, getKeys, has, set } from 'utils/reflect';
import { WebPerformanceObserver } from 'core/webPerformance';
import { UserBehaviorObserver } from 'core/userBehavior';
import { isObject } from 'utils/typeJudgment';
import { ErrorObserver } from 'core/errListener';

/**
 * @description merge configurations recursively
 */
const mergeRecursive = (userConfig: any, initConfig: GazeConfig): GazeConfig =>
  getKeys(userConfig).reduce((prev, k) => {
    // if this key in the user configuration exists in the default configuration
    if (has(prev, k)) {
      const configItem = get(initConfig, k);
      set(
        prev,
        k,
        isObject(configItem)
          ? // process recursively  if this value is an object
            mergeRecursive(has(userConfig, k) ? get(userConfig, k) : {}, configItem)
          : // otherwise the value will be assigned directly
            get(userConfig, k)
      );
    }

    return prev;
  }, initConfig);

/**
 * @description merge user configurations and default configurations
 */
const mergeConfig = (userConfig: any): GazeConfig =>
  mergeRecursive(
    userConfig,
    // default config
    {
      target: 'http://localhost:3001',
      token: '',
      release: '',
      performance: {
        uploadImmediately: true,
        duration: 5000
      },
      error: {
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
    const { target, performance, error, behavior } = mergedConfig;

    new WebPerformanceObserver(target, performance!).init();
    new UserBehaviorObserver(target, behavior!).init();
    new ErrorObserver(target, error!).init();
  }
}
