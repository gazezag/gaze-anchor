import { EnvInfo } from './envInfo';
import { PerformanceInfo } from './performanceInfo';
import { ApiPerformanceInfo } from './apiPerformanceInfo';
import { ErrorInfo } from './errorInfo';

interface RequestData {
  sendTime: DOMHighResTimeStamp;
}

export interface EnvInfoRequest extends RequestData {
  data: EnvInfo;
}

export interface PerformanceInfoRequest extends RequestData {
  data: PerformanceInfo;
}

export interface ApiPerformanceInfoRequest extends RequestData {
  data: ApiPerformanceInfo;
}

export interface ErrorInfoRequest extends RequestData {
  data: ErrorInfo;
}
