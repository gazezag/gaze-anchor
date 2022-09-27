import { LifeCycleHookTypes } from '@gaze-anchor/static';
import { Uploader } from './uploader';
import { HookCallback, Hooks } from './hook';
import { ErrorHandler } from './errorHandler';

type PluginInstallFunction = (uploader: Uploader, errorHandler: ErrorHandler, hooks: Hooks) => void;

export interface PluginConfig {
  // TODO
}

export interface Plugin {
  install: PluginInstallFunction;

  // life cycle hook
  [LifeCycleHookTypes.BEFORE_INSTALL]?: HookCallback<PluginConfig>;
  [LifeCycleHookTypes.INSTALLED]?: HookCallback;
  [LifeCycleHookTypes.BEFOR_UPLOAD]?: HookCallback;
  [LifeCycleHookTypes.UPLOADED]?: HookCallback;
}

export type PluginDefineFunction<T extends PluginConfig | null> = (options: T) => Plugin;
