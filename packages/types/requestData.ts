import { EnvInfo } from './envInfo';
import { PerformanceNavigationIndex } from './performanceIndex';
import { ApiPerformanceInfo } from './apiPerformanceInfo';
import { ErrorInfo } from './errorInfo';

export interface RequestData<T> {
  sendTime: DOMHighResTimeStamp;
  data: T;
}

export type EnvInfoRequest = RequestData<EnvInfo>;
export type PerformanceNavigationIndexRequest = RequestData<PerformanceNavigationIndex>;
export type ApiPerformanceInfoRequest = RequestData<ApiPerformanceInfo>;
export type ErrorInfoRequest = RequestData<ErrorInfo>;
