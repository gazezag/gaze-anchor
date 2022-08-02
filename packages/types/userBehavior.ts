export interface ApiPerformanceInfo {
  url: string;
  type: 'xhr' | 'fetch';
  param?: any;
  response: any;
  // TODO
}

// TODO to be replenished
export type UserBehaviorInfo = ApiPerformanceInfo;
