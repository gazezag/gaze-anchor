import { PluginConfig } from 'shared-types';

export interface Config extends PluginConfig {
  logError: boolean;
  stackLimit: number;
}
