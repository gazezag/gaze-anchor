import { ErrorInfo } from 'types/errorInfo';
import { PerformanceInfo } from 'types/performanceIndex';
import {
  BehaviorInfoUploader,
  ErrorInfoUploader,
  PerformanceInfoUploader,
  RequestData
} from 'types/uploader';
import { UserBehavior, VisitInfo } from 'types/userBehavior';
import { isBeaconSupported } from 'utils/compatible';
import { uploadTarget } from './static';

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

  const client = new XMLHttpRequest();
  client.open('POST', url, false);
  client.setRequestHeader('Content-Type', 'application/json; charset=utf-8');
  client.send(JSON.stringify(data));
};

const upload = (url: string, data: any) => {
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

export const createPerformanceUploader =
  (config?: any): PerformanceInfoUploader =>
  (data: PerformanceInfo) =>
    upload(uploadTarget.proformance, getRequestData(data));

export const createErrInfoUploader =
  (config?: any): ErrorInfoUploader =>
  (data: ErrorInfo) =>
    upload(uploadTarget.errInfo, getRequestData(data));

export const createBehaviorInfoUploader =
  (config?: any): BehaviorInfoUploader =>
  (data: UserBehavior | VisitInfo) =>
    upload(uploadTarget.userBehavior, getRequestData(data));
