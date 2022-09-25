import { Uploader } from '@gaze-anchor/shared-types';
import {
  isPerformanceObserverSupported,
  isPerformanceSupported,
  roundOff,
  getNow,
  disconnect,
  observe,
  ObserveHandler
} from '@gaze-anchor/shared-utils';
import { ResourceFlowTiming } from '../types/performanceIndex';
import { EntryTypes, PerformanceInfoType, UploadTarget } from '../static';

const { resourceFlowTarget } = UploadTarget;

const getResourceFlowTiming = (): Promise<Array<ResourceFlowTiming>> => {
  const resourceFlow: Array<ResourceFlowTiming> = [];

  const calcResourceFlow = (
    entry: PerformanceResourceTiming,
    resourceFlow: Array<ResourceFlowTiming>
  ) => {
    const {
      name,
      transferSize,
      initiatorType,
      startTime,
      responseEnd,
      domainLookupEnd,
      domainLookupStart,
      connectStart,
      connectEnd,
      secureConnectionStart,
      responseStart,
      requestStart
    } = entry;

    resourceFlow.push({
      time: getNow(),
      name,
      transferSize,
      initiatorType,
      startTime: roundOff(startTime),
      responseEnd: roundOff(responseEnd),
      DNS: roundOff(domainLookupEnd - domainLookupStart),
      initialConnect: roundOff(connectEnd - connectStart),
      SSL: roundOff(connectEnd - secureConnectionStart),
      request: roundOff(responseStart - requestStart),
      TTFB: roundOff(responseStart - requestStart),
      transmit: roundOff(responseEnd - responseStart),
      contentDownload: roundOff(responseStart - requestStart)
    });
  };

  // TODO added cache-hit-rate
  // TODO cache-hit: duration == 0 && transferSize !== 0
  return new Promise((resolve, reject) => {
    if (!isPerformanceSupported()) {
      reject(new Error('browser does not support the performance API'));
    } else if (!isPerformanceObserverSupported()) {
      reject(new Error('browser does not support the PerformanceObserver'));
    } else {
      const callback = (entry: PerformanceResourceTiming) => {
        if (entry.entryType === EntryTypes.resource) {
          resourceObserver && disconnect(resourceObserver);

          calcResourceFlow(entry, resourceFlow);

          resolve(resourceFlow);
        }
      };

      const resourceObserver = observe(
        EntryTypes.resource,
        // must be asserted
        // maybe bug here
        callback as ObserveHandler
      );
    }
  });
};

export const initResourceFlowTiming = (upload: Uploader) => {
  const { RF } = PerformanceInfoType;

  getResourceFlowTiming()
    .then(resourceFlow => {
      const indexValue = {
        type: RF,
        time: getNow(),
        value: resourceFlow
      };

      upload(resourceFlowTarget, indexValue);
    })
    .catch(err => console.error(err));
};
