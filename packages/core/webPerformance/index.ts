import { Store, PerformanceInfoType, createUploader } from 'core/common';
import { PerformanceCaptureConfig } from 'types/gaze';
import { PerformanceInfo } from 'types/performanceIndex';
import { Uploader } from 'types/uploader';
import { afterLoad, onPageShow } from 'utils/pageHook';
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
  private uploader: Uploader;
  private immediately: boolean;

  constructor(baseURL: string, config: PerformanceCaptureConfig) {
    const { uploadImmediately, duration } = config;

    this.store = new Store();
    this.uploader = createUploader(baseURL);
    this.immediately = uploadImmediately!;
  }

  init() {
    initDeviceInfo(this.store, this.uploader, this.immediately);

    initCLS(this.store, this.uploader, this.immediately);
    initLCP(this.store, this.uploader, this.immediately);

    // monitor FP and FCP while page had shown
    onPageShow(() => {
      initFP(this.store, this.uploader, this.immediately);
      initFCP(this.store, this.uploader, this.immediately);
    });

    afterLoad(() => {
      initNavigationTiming(this.store, this.uploader, this.immediately);
      initResourceFlowTiming(this.store, this.uploader, this.immediately);
      initFID(this.store, this.uploader, this.immediately);
    });
  }
}
