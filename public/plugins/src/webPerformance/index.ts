import { PluginDefineFunction } from 'shared-types';
import { afterLoad, onPageShow } from 'shared-utils';
import {
  initCLS,
  initDeviceInfo,
  initFCP,
  initFID,
  initFP,
  initLCP,
  initNavigationTiming,
  initResourceFlowTiming
} from './performanceIndex';

export const performanceIndexPlugin: PluginDefineFunction<null> = () => {
  return {
    install(uploader) {
      initDeviceInfo(uploader);

      initCLS(uploader);
      initLCP(uploader);

      // monitor FP and FCP while page had shown
      onPageShow(() => {
        initFP(uploader);
        initFCP(uploader);
      });

      afterLoad(() => {
        initNavigationTiming(uploader);
        initResourceFlowTiming(uploader);
        initFID(uploader);
      });
    }
  };
};
