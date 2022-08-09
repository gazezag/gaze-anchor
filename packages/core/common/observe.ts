import { curry } from 'utils/functional';

export type ObserveHandler = (entry: PerformanceEntry) => void;

export const observe = (
  entryTypes: Array<string> | string,
  callback: ObserveHandler
): PerformanceObserver => {
  const observer = new PerformanceObserver(
    entryList =>
      entryList // entryList is the main entrance to the matched
        .getEntries() // get all entry
        .map(callback) // traverse the entry list and call the handler function with arugment entry
  );

  Array.isArray(entryTypes)
    ? observer.observe({ entryTypes })
    : observer.observe({ type: entryTypes, buffered: true });

  // return the whole observer object
  return observer;
};

export const getObserveFn = curry(observe);
// ts sucks...
// type of ObserveHandler does not support
// export const getObserveFn = (entryTypes: Array<string>) => {
//   return (callback: ObserveHandler): PerformanceObserver => {
//     const observer = new PerformanceObserver(
//       entryList =>
//         entryList // entryList is the main entrance to the matched
//           .getEntries() // get all entry
//           .map(callback) // traverse the entry list and call the handler function with arugment entry
//     );

//     observer.observe({ entryTypes });
//   };
// };

export const disconnect = (observer: PerformanceObserver) => {
  observer.disconnect();
};

export const takeRecords = (observer: PerformanceObserver): Array<PerformanceEntry> =>
  observer.takeRecords();
