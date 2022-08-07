import { createPerformanceUploader, Store, PerformanceInfoType, EventType } from 'core/common';
import { PerformanceCaptureConfig } from 'types/gaze';
import { PerformanceInfo } from 'types/performanceIndex';
import { PerformanceInfoUploader } from 'types/uploader';
import { createlistener } from 'utils/eventHandler';
import { afterLoad } from 'utils/pageHook';
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

export class WebPerformanceObserver {
  private store: Store<PerformanceInfoType, PerformanceInfo>;
  private uploader: PerformanceInfoUploader;
  private immediately: boolean;

  constructor(config: PerformanceCaptureConfig) {
    const { uploadImmediately, duration } = config;

    this.store = new Store();
    this.uploader = createPerformanceUploader(this.store, duration!);
    this.immediately = uploadImmediately!;
  }

  init() {
    initDeviceInfo(this.store, this.uploader, this.immediately);

    initCLS(this.store, this.uploader, this.immediately);
    initLCP(this.store, this.uploader, this.immediately);

    // monitor FP and FCP while page had shown
    createlistener(EventType.pageshow)(
      () => {
        initFP(this.store, this.uploader, this.immediately);
        initFCP(this.store, this.uploader, this.immediately);
      },
      { once: true, capture: true }
    );

    afterLoad(() => {
      initNavigationTiming(this.store, this.uploader, this.immediately);
      initResourceFlowTiming(this.store, this.uploader, this.immediately);
      initFID(this.store, this.uploader, this.immediately);
    });

    // TODO upload the data while pages unloaded
  }
}
