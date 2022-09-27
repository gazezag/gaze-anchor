import { PluginConfig } from '@gaze-anchor/shared';

export interface Config extends PluginConfig {
  logError: boolean;
  stackLimit: number;
}
