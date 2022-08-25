import { Uploader } from 'types/uploader';
import { isPerformanceObserverSupported, isPerformanceSupported } from 'utils/compatible';
import { roundOff } from 'utils/math';
import { disconnect, observe, ObserveHandler, takeRecords } from 'core/common/observe';
import { EntryTypes, PerformanceInfoType } from 'core/common/static';
import { Store } from 'core/common/store';
import { PerformanceInfo } from 'types/performanceIndex';
import { onHidden } from 'utils/pageHook';
import { getNow } from 'utils/timestampHandler';
import { UploadTarget } from 'core/common';
const { performanceTimingTarget } = UploadTarget;

interface LayoutShift extends PerformanceEntry {
  value: number;
  hadRecentInput: boolean;
}

// Cumulative Layout Shift
const getCLS = (cls: { value: number }): Promise<PerformanceObserver> =>
  new Promise((resolve, reject) => {
    if (!isPerformanceObserverSupported()) {
      if (!isPerformanceSupported()) {
        reject(new Error('browser do not support performance api'));
      } else {
        reject(new Error('browser do not support performance observer'));
      }
    } else {
      const callback = (entry: LayoutShift) => {
        if (!entry.hadRecentInput) {
          cls.value += entry.value;
        }
      };

      resolve(observe(EntryTypes.CLS, callback as ObserveHandler));
    }
  });

export const initCLS = (
  store: Store<PerformanceInfoType, PerformanceInfo>,
  upload: Uploader,
  immediately: boolean
) => {
  const { CLS } = PerformanceInfoType;
  const cls = { value: 0 };

  getCLS(cls)
    .then(observer => {
      const clearListener = () => {
        takeRecords(observer).forEach(entry => {
          // have to make type assertions here.... ts sucks
          if (!(entry as LayoutShift).hadRecentInput) {
            // accumulate cls
            cls.value += (entry as LayoutShift).value;
          }
        });

        disconnect(observer);

        const indexValue = {
          type: CLS,
          time: getNow(),
          value: roundOff(cls.value * 1000)
        };

        store.set(CLS, indexValue);

        immediately && upload(performanceTimingTarget, indexValue);
      };

      // report while the page is hidden
      onHidden(clearListener);
    })
    .catch(err => console.error(err));
};
