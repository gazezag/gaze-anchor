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

export interface ClickDetail {
  // TODO
}

export interface CustomDefineDetail {
  // TODO
}

export interface HttpDetail {
  // TODO
}

export interface BehaviorItem {
  type: BehaviorType;
  page: string;
  time: DOMHighResTimeStamp;
  detail:
    | PageInfoDetail
    | OriginInfoDetail
    | RouterChangeDetail
    | ClickDetail
    | CustomDefineDetail
    | HttpDetail;
}

// TODO to be replenished
export type UserBehavior = Array<BehaviorItem>;
