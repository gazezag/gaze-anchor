import { createPerformanceUploader, Store, PerformanceInfoType } from 'core/common';
import { PerformanceInfo } from 'types/performanceIndex';
import { PerformanceInfoUploader } from 'types/uploader';
import { afterLoad } from 'utils/pageHook';
import {
  initCLS,
  initDeviceInfo,
  initFCP,
  initFID,
  initFP,
  initLCP,
  initNavigationTiming
} from './performanceIndex';

export class WebPerformanceObserver {
  private store: Store<PerformanceInfoType, PerformanceInfo>;
  private uploader: PerformanceInfoUploader;

  // TODO
  constructor(config: any) {
    this.store = new Store();
    this.uploader = createPerformanceUploader(config);
  }

  init() {
    initDeviceInfo(this.store, this.uploader);

    initCLS(this.store, this.uploader);
    initLCP(this.store, this.uploader);

    // monitor FP and FCP while page had shown
    window.addEventListener(
      'pageshow',
      () => {
        initFP(this.store, this.uploader);
        initFCP(this.store, this.uploader);
      },
      { once: true, capture: true }
    );

    afterLoad(() => {
      initNavigationTiming(this.store, this.uploader);
      initFID(this.store, this.uploader);
    });

    // TODO upload the data while pages unloaded
  }

  getAll() {
    return this.store.getAll();
  }
}
