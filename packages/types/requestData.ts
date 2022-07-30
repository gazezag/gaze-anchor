import { EnvInfo } from './envInfo';
import { PerformanceInfo } from './performanceInfo';
import { ApiPerformanceInfo } from './apiPerformanceInfo';
import { ErrorInfo } from './errorInfo';

export interface RequestData<T> {
  sendTime: DOMHighResTimeStamp;
  data: T;
}

export type EnvInfoRequest = RequestData<EnvInfo>;
export type PerformanceInfoRequest = RequestData<PerformanceInfo>;
export type ApiPerformanceInfoRequest = RequestData<ApiPerformanceInfo>;
export type ErrorInfoRequest = RequestData<ErrorInfo>;
