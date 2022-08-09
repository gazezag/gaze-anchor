import { PerformanceInfoUploader } from 'types/uploader';
import { isPerformanceObserverSupported, isPerformanceSupported } from 'utils/compatible';
import { roundOff } from 'utils/math';
import { disconnect, observe, ObserveHandler, takeRecords } from 'core/common/observe';
import { EntryTypes, PerformanceInfoType } from 'core/common/static';
import { Store } from 'core/common/store';
import { PerformanceInfo } from 'types/performanceIndex';
import { getFirstHiddenTime } from 'utils/eventHandler';
import { onHidden } from 'utils/pageHook';

const getFID = (): Promise<PerformanceEventTiming> =>
  new Promise((resolve, reject) => {
    if (!isPerformanceObserverSupported()) {
      if (!isPerformanceSupported()) {
        reject(new Error('browser do not support performance api'));
      } else {
        reject(new Error('browser do not support performance observer'));
      }
    } else {
      const firstHiddenTime = getFirstHiddenTime();

      const callback = (entry: PerformanceEventTiming) => {
        if (entry.entryType === EntryTypes.FID && entry.startTime < firstHiddenTime) {
          resolve(entry);
        }
      };

      const observer = observe(EntryTypes.FID, callback as ObserveHandler);

      // listene to the hidden event
      // only upload the data when the page has never been hidden
      onHidden(() => {
        takeRecords(observer).forEach(callback as ObserveHandler);
        disconnect(observer);
      });
    }
  });

export const initFID = (
  store: Store<PerformanceInfoType, PerformanceInfo>,
  upload: PerformanceInfoUploader,
  immediately: boolean
) => {
  getFID()
    .then((entry: PerformanceEventTiming) => {
      const { FID } = PerformanceInfoType;

      const indexValue = {
        type: FID,
        value: {
          eventName: entry.name,
          // to be determined
          target: entry.target?.nodeName,
          startTime: roundOff(entry.startTime),
          delay: roundOff(entry.processingStart - entry.startTime),
          eventHandleTime: roundOff(entry.processingEnd - entry.processingStart)
        }
      };

      store.set(FID, indexValue);

      immediately && upload(indexValue);
    })
    .catch(err => console.error(err));
};
