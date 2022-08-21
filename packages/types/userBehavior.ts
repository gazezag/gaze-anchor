import { BehaviorType } from 'core/common';

export interface RouterChangeDetail {
  method: 'History' | 'Hash';
  href: string;
  pathname?: string;
  hash?: string;
}

export interface HttpDetail {
  method: string;
  url: string | URL;
  status: number;
  statusText: string;
  headers: {
    [header: string]: string;
  };
  body: Document | XMLHttpRequestBodyInit | string | ReadableStream;
  requestTime: DOMHighResTimeStamp;
  responseTime: DOMHighResTimeStamp;
  response: any;
}

export interface OperationDetail {
  type: string;
  target: any;
  count: number;
  id: string;
  classList: Array<string>;
  tagName: string;
  innerText: string;
}

export interface BehaviorItem {
  type: BehaviorType;
  page: string;
  time: number;
  detail: RouterChangeDetail | HttpDetail | OperationDetail;
}

export interface VisitInfo {
  time: number;
  origin: string;
  type: string;
}

export interface UserBehavior {
  time: number;
  value: Array<BehaviorItem>;
}
