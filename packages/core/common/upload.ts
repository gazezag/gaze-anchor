import { ErrorInfo, uid } from 'types/errorInfo';
import { PerformanceInfo } from 'types/performanceIndex';
import {
  BehaviorInfoUploader,
  ErrorInfoUploader,
  PerformanceInfoUploader,
  RequestData
} from 'types/uploader';
import { UserBehavior, VisitInfo } from 'types/userBehavior';
import { isBeaconSupported } from 'utils/compatible';
import { get, has } from 'utils/reflect';
import { BehaviorType, PerformanceInfoType, UploadTarget } from './static';
import { Store } from './store';

// TODO
const imgRequest = (url: string, data: any) => {
  if (!url || !data) return;

  const img = new Image();

  img.onload = () => {
    console.log('loaded...');
  };

  img.onerror = () => {
    console.log('error....');
  };

  img.src = `${url}${url.indexOf('?') < 0 ? '?' : '&'}${encodeURIComponent(JSON.stringify(data))}`;
};

const beaconRequest = (url: string, data: any) => {
  if (!url || !data) return;

  const headers = {
    type: 'application/x-www-form-urlencoded'
  };

  navigator.sendBeacon(url, new Blob([JSON.stringify(data)], headers));
};

const ajaxRequest = (url: string, data: any) => {
  if (!url || !data) return;

  // send ajax request with native XMLHttpRequest
  const xhr = has(window, 'nativeXhr') ? get(window, 'nativeXhr') : get(window, 'XMLHttpRequest');

  const client = xhr();
  client.open('POST', url, false);
  client.setRequestHeader('Content-Type', 'application/json; charset=utf-8');
  client.send(JSON.stringify(data));
};

const createUploader = (url: string) => (data: any) => {
  const len = `${url}${url.indexOf('?') < 0 ? '?' : '&'}${encodeURIComponent(JSON.stringify(data))}`
    .length;

  // 2083 compatible with ie browser
  // chrome 8182
  // safari 80000
  // firefox 65536
  // opera 190000
  if (len < 2083) {
    imgRequest(url, data);
  } else if (isBeaconSupported()) {
    beaconRequest(url, data);
  } else {
    ajaxRequest(url, data);
  }
};

const getRequestData = <T>(data: T): RequestData<T> => ({
  sendTime: performance.now(),
  data
});

export const createPerformanceUploader = (
  store: Store<PerformanceInfoType, PerformanceInfo>,
  duration: number
): PerformanceInfoUploader => {
  const upload = createUploader(UploadTarget.proformance);

  setInterval(() => {
    upload(getRequestData(store.getAll()));
  }, duration);

  return (data: PerformanceInfo) => {
    upload(getRequestData(data));
  };
};

export const createErrInfoUploader = (
  store: Store<uid, ErrorInfo>,
  duration: number
): ErrorInfoUploader => {
  const upload = createUploader(UploadTarget.errInfo);

  setInterval(() => {
    upload(getRequestData(store.getAll()));
  }, duration);

  return (data: ErrorInfo) => upload(getRequestData(data));
};

export const createBehaviorInfoUploader = (
  store: Store<BehaviorType, UserBehavior>,
  duration: number
): BehaviorInfoUploader => {
  const upload = createUploader(UploadTarget.userBehavior);

  setInterval(() => {
    upload(getRequestData(store.getAll()));
  }, duration);

  return (data: UserBehavior | VisitInfo) => upload(getRequestData(data));
};
