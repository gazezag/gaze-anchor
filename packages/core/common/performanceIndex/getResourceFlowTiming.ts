import { ResourceFlowTiming } from 'types/performanceIndex';
import { ReportHandler } from 'types/uploader';
import { isPerformanceObserverSupported, isPerformanceSupported } from 'utils/compatible';
import { roundOff } from 'utils/math';
import { disconnect, observe, ObserveHandler } from '../observe';
import { EntryTypes, PerformanceInfoType } from '../static';
import { Store } from '../store';

const getResourceFlowTiming = (): Promise<ResourceFlowTiming> | undefined => {
  if (!isPerformanceSupported()) {
    console.warn('Performance API not support');
    return;
  }

  const resolveResourceFlow = (entry: PerformanceResourceTiming, resolve: (value: any) => void) => {
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

    resolve({
      name,
      transferSize,
      initiatorType,
      startTime,
      responseEnd,
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

          resolveResourceFlow(entry, resolve);
        }
      };

      const resourceObserver = observe(
        [EntryTypes.resource],
        // must be asserted
        // maybe bug here
        callback as ObserveHandler
      );
    }
  });
};

export const initResourceFlowTiming = (store: Store, report: ReportHandler, immediately = true) => {
  getResourceFlowTiming()
    // maybe bug here
    // resourceFlow sounds like a Array....
    ?.then(resourceFlow => {
      const indexValue = {
        type: PerformanceInfoType.FP,
        value: resourceFlow
      };

      store.set(PerformanceInfoType.FP, indexValue);

      immediately && report(indexValue);
    })
    .catch(err => console.error(err));
};
