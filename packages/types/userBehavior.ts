import { BehaviorType } from 'core/common';

export interface PageInfoDetail {
  // TODO
}

export interface OriginInfoDetail {
  // TODO
}

export interface RouterChangeDetail {
  method: 'History' | 'Hash';
  href: string;
  pathname?: string;
  hash?: string;
}

export interface OperationDetail {
  id: string;
  classList: Array<string>;
  tagName: string;
  text: string;
}

export interface CustomDefineDetail {
  // TODO
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

export interface BehaviorItem {
  type: BehaviorType;
  page: string;
  time: DOMHighResTimeStamp;
  detail:
    | PageInfoDetail
    | OriginInfoDetail
    | RouterChangeDetail
    | OperationDetail
    | CustomDefineDetail
    | HttpDetail;
}

export interface VisitInfo {
  time: DOMHighResTimeStamp;
  // TODO
  origin: string;
}

// TODO to be replenished
export type UserBehavior = Array<BehaviorItem>;
