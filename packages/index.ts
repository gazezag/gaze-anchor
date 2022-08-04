import { WebPerformanceObserver } from 'core/webPerformance';
import { GazeConfig } from 'types/gaze';
import { get, getKeys, has, set } from 'utils/reflect';

// TODO
const mergeConfig = (userConfig: GazeConfig): GazeConfig =>
  getKeys(userConfig).reduce(
    (prev, k) => {
      has(prev, k) && set(prev, k, get(userConfig, k));
      return prev;
    },
    {
      target: 'http://localhost:9000',
      stackLimit: 10,
      logErrors: false,
      release: ''
    }
  );

export class Gaze {
  static init(config: GazeConfig) {
    const mergedConfig = mergeConfig(config);

    new WebPerformanceObserver(mergedConfig).init();
    // TODO
  }
}
