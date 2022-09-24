import { Uploader } from './uploader';

type PluginInstallFunction = (uploader: Uploader) => void;

export interface Plugin {
  install: PluginInstallFunction;
}

export interface PluginConfig {
  // TODO
}

export type PluginDefineFunction<T extends PluginConfig | null> = (options: T) => Plugin;
