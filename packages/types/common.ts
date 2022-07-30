// 'frame' not supported
export type EntryType = 'navigation' | 'resource' | 'mark' | 'paint';

/**
 * @example
 * {
 *    name: 'http://localhost:5173/src/assets/vue.svg',
 *    entryType: 'resource',
 *    startTime: 124.30000001192093,
 *    duration: 2.199999988079071
 * }
 *
 * {
 *    name: 'first-paint',
 *    entryType: 'paint',
 *    startTime: 94.89999997615814,
 *    duration: 0
 * }
 */
export interface PerformanceEntry {
  readonly name: string;
  readonly entryType: EntryType;
  readonly startTime: DOMHighResTimeStamp;
  readonly duration: DOMHighResTimeStamp;
}

export interface ObserverEntry {
  getEntries(): Array<PerformanceEntry>;
  getEntriesByName(name: string, type?: EntryType): Array<PerformanceEntry>;
  getEntriesByType(type: EntryType): Array<PerformanceEntry>;
}
