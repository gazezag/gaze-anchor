import { PerformanceInfo, PerformanceNavigationIndex } from './performanceIndex';
import { UserBehavior, VisitInfo } from './userBehavior';
import { ErrorInfo } from './errorInfo';

export type UploadHandler<T> = (data: T) => void;

export type PerformanceInfoUploader = UploadHandler<PerformanceInfo>;
export type ErrorInfoUploader = UploadHandler<ErrorInfo>;
export type BehaviorInfoUploader = UploadHandler<UserBehavior | VisitInfo>;

export interface RequestData<T> {
  sendTime: DOMHighResTimeStamp;
  data: T;
}

export type PerformanceNavigationIndexRequest = RequestData<PerformanceNavigationIndex>;
export type ErrorInfoRequest = RequestData<ErrorInfo>;
export type UserBehaviorRequest = RequestData<UserBehavior>;
