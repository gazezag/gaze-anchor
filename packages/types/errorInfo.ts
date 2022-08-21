import { ErrorType } from 'core/common';

export interface ErrorStep {
  filename: string;
  functionName: string;
  line: number;
  col: number;
}
// JS
export interface JsErrorDetail {
  type: string;
  stackTrace: Array<ErrorStep>;
}

// Unhandle Rejection
export interface PromiseRejectDetail {
  type: string;
  stackTrace: Array<ErrorStep>;
  reason: string;
}

// Resource Error
export interface ResourceErrorDetail {
  src?: string;
  type?: string;
  outerHTML?: string;
  tagName?: string;
}

// HTTP Error
export interface HttpErrorDetail {
  status: number;
  response: string;
  statusText: string;
}

export interface CorsErrorDetail {
  target: string;
}

export type uid = string;

// 格式化的错误信息
export interface ErrorInfo {
  type: ErrorType;
  // 唯一标识
  errorUid: uid;
  // 错误发生的时间
  time: number;
  // 原生报错信息
  message: string;
  // 报错细节
  detail:
    | JsErrorDetail
    | PromiseRejectDetail
    | ResourceErrorDetail
    | HttpErrorDetail
    | CorsErrorDetail;
}
