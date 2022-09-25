import { PluginConfig } from '@gaze-anchor/shared-types';

export interface Config extends PluginConfig {
  logError: boolean;
  stackLimit: number;
}
