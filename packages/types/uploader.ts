import { DeviceEnvInfo } from './deviceEnvInfo';
import { PerformanceInfo, PerformanceInfoObj, PerformanceNavigationIndex } from './performanceIndex';
import { ApiPerformanceInfo } from './apiPerformanceInfo';
import { ErrorInfo } from './errorInfo';

export type UploadHandler = (data: PerformanceInfo | PerformanceInfoObj) => void;

export interface RequestData<T> {
  sendTime: DOMHighResTimeStamp;
  data: T;
}

export type EnvInfoRequest = RequestData<DeviceEnvInfo>;
export type PerformanceNavigationIndexRequest = RequestData<PerformanceNavigationIndex>;
export type ApiPerformanceInfoRequest = RequestData<ApiPerformanceInfo>;
export type ErrorInfoRequest = RequestData<ErrorInfo>;
