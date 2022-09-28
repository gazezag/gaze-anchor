import { get, getKeys, has, isObject, set, ErrorHandler, Plugin } from '@gaze-anchor/shared';
import { createUploader } from './upload';
import { errorHandler } from './errorHandler';
import { GazeConfig } from './types';
import { Injector } from './injector';

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

const nextTick = (fn: Function, errorHandler: ErrorHandler) => {
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
  static instance: Gaze;
  private plugins: Set<Plugin>;
  private injector: Injector;
  private errorHandler: ErrorHandler;

  private constructor(config?: Record<string, any>) {
    const { target } = mergeConfig(config);
    this.plugins = new Set<Plugin>();
    this.injector = Injector.getInstance([createUploader(target)]);
    this.errorHandler = errorHandler;
  }

  // singleton mode
  static getInstance(config?: Record<string, any>) {
    if (!this.instance) {
      this.instance = new Gaze(config);
    }
    return this.instance;
  }

  use(plugin: Plugin): this {
    // execute asynchronously to avoid blocking the main process
    nextTick(() => {
      if (!this.plugins.has(plugin)) {
        this.plugins.add(plugin);
        // inject dependencies into the plugin dynamically and execute it
        this.injector.resolve(plugin)();
      }
    }, this.errorHandler);

    return this;
  }
}

export const createGaze = (config?: Record<string, any>) => {
  return Gaze.getInstance(config);
};
