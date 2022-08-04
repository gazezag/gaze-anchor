import { PerformanceInfo, ResourceFlowTiming } from 'types/performanceIndex';
import { PerformanceInfoUploader } from 'types/uploader';
import { isPerformanceObserverSupported, isPerformanceSupported } from 'utils/compatible';
import { roundOff } from 'utils/math';
import { disconnect, observe, ObserveHandler } from 'core/common/observe';
import { EntryTypes, PerformanceInfoType } from 'core/common/static';
import { Store } from 'core/common/store';

const getResourceFlowTiming = (): Promise<Array<ResourceFlowTiming>> | undefined => {
  if (!isPerformanceSupported()) {
    console.warn('Performance API not support');
    return;
  }
  if (!isPerformanceObserverSupported()) {
    console.warn('Performance Observer not support');
    return;
  }

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
    if (!isPerformanceObserverSupported()) {
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

export const initResourceFlowTiming = (
  store: Store<PerformanceInfoType, PerformanceInfo>,
  upload: PerformanceInfoUploader,
  immediately = true
) => {
  getResourceFlowTiming()
    // maybe bug here
    // resourceFlow sounds like a Array....
    ?.then(resourceFlow => {
      const indexValue = {
        type: PerformanceInfoType.RF,
        value: resourceFlow
      };

      store.set(PerformanceInfoType.RF, indexValue);

      immediately && upload(indexValue);
    })
    .catch(err => console.error(err));
};
