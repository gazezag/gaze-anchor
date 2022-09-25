import { get, getKeys, has, isObject, set } from 'shared-utils';
import { Uploader, Plugin } from 'shared-types';
import { errorHandler } from './errorHandler';
import { GazeConfig } from './types';
import { createUploader } from './upload';

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
