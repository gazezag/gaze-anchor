import { roundOff } from '@gaze-anchor/shared-utils';
import { CustomMeasure, MeasureOptions, Once } from './types';

/**
 * @description the mark to start this measurement
 * @param { string } name unique identification of this current tag
 */
export const timeStart = (name: string) => {
  performance.mark(name);
};
/**
 * @description the mark to end this measurement
 * @param { string } name unique identification of this current tag
 */
export const timeEnd = (name: string) => {
  performance.mark(name);
};

/**
 * @description measure the time spent between two markers
 * @param { string } start name of the start tag
 * @param { string } end name of the end tag
 * @param { MeasureOptions | Once } options custom configuration
 * @return { CustomMeasure | undefined } measurement results
 */
export const measure = (
  start: string,
  end: string,
  options?: MeasureOptions | Once
): CustomMeasure | undefined => {
  if (start && end && start === end) return;

  const startName = start || undefined;
  const endName = end || undefined;
  const name = `${startName ? startName : 'navigation start'} to ${endName ? endName : 'now'}`;

  performance.measure(name, startName, endName);
  const m = performance.getEntriesByType('measure').find(m => m.name === name);
  if (m) {
    const { name, startTime, duration } = m;

    const once = typeof options === 'object' ? options?.once || true : options;
    const roundOffRange = typeof options === 'object' ? options?.roundOff || 3 : 3;

    if (once) {
      startName && performance.clearMarks(startName);
      endName && performance.clearMarks(endName);
      performance.clearMeasures(name);
    }

    return {
      description: name,
      startTime: roundOff(startTime, roundOffRange),
      duration: roundOff(duration, roundOffRange)
    };
  }
};

/**
 * @description measure the time spent from start tag to now
 * @param { string } start name of the start tag
 * @param { MeasureOptions | Once } options custom configuration
 * @return { CustomMeasure | undefined } measurement results
 */
export const measureToNow = (start: string, options?: MeasureOptions | Once) => {
  return measure(start, '', options);
};
/**
 * @description measure the time spent from navigation start to the end tag
 * @param { string } end name of the end tag
 * @param { MeasureOptions | Once } options custom configuration
 * @return { CustomMeasure | undefined } measurement results
 */
export const measureFromNavigationTo = (end: string, options?: MeasureOptions | Once) => {
  return measure('', end, options);
};
/**
 * @description measure the time spent from navigation start to now
 * @param { MeasureOptions | Once } options custom configuration
 * @return { CustomMeasure | undefined } measurement results
 */
export const measureFromNavigationToNow = (options?: MeasureOptions | Once) => {
  return measure('', '', options);
};
