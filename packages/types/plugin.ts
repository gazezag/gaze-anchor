import { ErrorHandler } from './errorHandler';
import { Uploader } from './uploader';

type PluginInstallFunction = (uploader: Uploader, errorHandler: ErrorHandler) => void;

export interface Plugin {
  install: PluginInstallFunction;
}

export interface PluginConfig {
  // TODO
}

export type PluginDefineFunction<T extends PluginConfig | null> = (options: T) => Plugin;
