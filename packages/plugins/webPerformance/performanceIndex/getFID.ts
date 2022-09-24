import { EntryTypes, PerformanceInfoType, UploadTarget } from '../static';
import { Uploader } from 'types/uploader';
import { isPerformanceObserverSupported, isPerformanceSupported } from 'utils/compatible';
import { roundOff } from 'utils/math';
import { disconnect, observe, ObserveHandler, takeRecords } from 'core/observe';
import { PerformanceInfo } from '../types/performanceIndex';
import { getFirstHiddenTime } from 'utils/eventHandler';
import { onHidden } from 'core/pageHook';
import { getNow } from 'utils/timestampHandler';
const { performanceTimingTarget } = UploadTarget;

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

export const initFID = (upload: Uploader) => {
  getFID()
    .then((entry: PerformanceEventTiming) => {
      const { FID } = PerformanceInfoType;

      const indexValue: PerformanceInfo = {
        type: FID,
        time: getNow(),
        value: {
          eventName: entry.name,
          // to be determined
          target: entry.target?.nodeName,
          startTime: roundOff(entry.startTime),
          delay: roundOff(entry.processingStart - entry.startTime),
          eventHandleTime: roundOff(entry.processingEnd - entry.processingStart)
        }
      };

      upload(performanceTimingTarget, indexValue);
    })
    .catch(err => console.error(err));
};
