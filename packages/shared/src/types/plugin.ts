import { LifeCycleHookTypes } from '@gaze-anchor/static';
import { Uploader } from './uploader';
import { HookCallback, Hooks } from './hook';

export interface PluginConfig {
  // TODO
}

type PluginInstallFunction = (upload: Uploader, hooks: Hooks) => void;

export interface Plugin {
  install: PluginInstallFunction;

  // life cycle hook
  [LifeCycleHookTypes.BEFORE_INSTALL]?: HookCallback<PluginConfig>;
  [LifeCycleHookTypes.INSTALLED]?: HookCallback;
  [LifeCycleHookTypes.BEFOR_UPLOAD]?: HookCallback;
  [LifeCycleHookTypes.UPLOADED]?: HookCallback;
}

export type PluginDefineFunction<T extends PluginConfig | null> = (options: T) => Plugin;
