import { GazeConfig } from 'types/gaze';
import { Plugin } from 'types/plugin';
import { createUploader } from './upload';
import { errorHandler } from './errorHandler';
import { Uploader } from 'types/uploader';
import { get, getKeys, has, isObject, set } from 'utils/index';

/**
 * @description merge configurations recursively
 */
const mergeRecursive = (userConfig: Record<string, any>, initConfig: GazeConfig): GazeConfig =>
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
const mergeConfig = (userConfig?: Record<string, any>): GazeConfig => {
  const defaultConfig: GazeConfig = {
    target: 'http://localhost:3001',
    token: '',
    release: ''
  };

  if (!userConfig) return defaultConfig;
  else return mergeRecursive(userConfig, defaultConfig);
};

const nextTick = (fn: Function) => {
  const timer = setTimeout(() => {
    try {
      fn();
    } catch (e: any) {
      errorHandler(e);
    } finally {
      clearTimeout(timer);
    }
  });
};

class Gaze {
  private plugins: Set<Plugin>;
  private uploader: Uploader;

  constructor(config?: Record<string, any>) {
    const { target } = mergeConfig(config);
    this.plugins = new Set<Plugin>();
    this.uploader = createUploader(target);
  }

  use(plugin: Plugin): this {
    // execute asynchronously to avoid blocking the main process
    nextTick(() => {
      if (!this.plugins.has(plugin)) {
        this.plugins.add(plugin);
        plugin.install(this.uploader);
      }
    });

    return this;
  }
}

export const createGaze = (config?: Record<string, any>) => {
  return new Gaze(config);
};

export * from './static';

export * from './errorHandler';

// common methods
export * from './observe';
export * from './proxyHttp';
export * from './proxyRouter';
export * from './upload';
export * from './pageHook';
