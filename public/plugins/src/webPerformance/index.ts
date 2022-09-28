import { afterLoad, onPageShow, PluginDefineFunction } from '@gaze-anchor/shared';
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
      const errorHandler = (e: Error) => {
        throw e;
      };

      initDeviceInfo(uploader, errorHandler);

      initCLS(uploader, errorHandler);
      initLCP(uploader, errorHandler);

      // monitor FP and FCP while page had shown
      onPageShow(() => {
        initFP(uploader, errorHandler);
        initFCP(uploader, errorHandler);
      });

      afterLoad(() => {
        initNavigationTiming(uploader, errorHandler);
        initResourceFlowTiming(uploader, errorHandler);
        initFID(uploader, errorHandler);
      });
    }
  };
};
