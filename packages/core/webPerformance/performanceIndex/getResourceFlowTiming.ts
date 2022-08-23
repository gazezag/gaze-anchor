import { PerformanceInfo, ResourceFlowTiming } from 'types/performanceIndex';
import { Uploader } from 'types/uploader';
import { isPerformanceObserverSupported, isPerformanceSupported } from 'utils/compatible';
import { roundOff } from 'utils/math';
import { disconnect, observe, ObserveHandler } from 'core/common/observe';
import { EntryTypes, PerformanceInfoType } from 'core/common/static';
import { Store } from 'core/common/store';
import { getNow } from 'utils/timestampHandler';
import { UploadTarget } from 'core/common';
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

export const initResourceFlowTiming = (
  store: Store<PerformanceInfoType, PerformanceInfo>,
  upload: Uploader,
  immediately: boolean
) => {
  const { RF } = PerformanceInfoType;

  getResourceFlowTiming()
    .then(resourceFlow => {
      const indexValue = {
        type: RF,
        time: getNow(),
        value: resourceFlow
      };

      store.set(RF, indexValue);

      immediately && upload(resourceFlowTarget, indexValue);
    })
    .catch(err => console.error(err));
};
