import { PluginConfig } from 'types/plugin';

export interface Config extends PluginConfig {
  logError: boolean;
  stackLimit: number;
}
