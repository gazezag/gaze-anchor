import { UploadHandler } from 'types/uploader';

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

const sendBeacon = (url: string, data: any) => {
  if (!url || !data) return;

  const headers = {
    type: 'application/x-www-form-urlencoded'
  };

  navigator.sendBeacon(url, new Blob([JSON.stringify(data)], headers));
};

const sendAjax = (url: string, data: any) => {
  const client = new XMLHttpRequest();
  client.open('POST', url, false);
  client.setRequestHeader('Content-Type', 'application/json; charset=utf-8');
  client.send(JSON.stringify(data));
};

const upload = (url: string, data: any) => {
  const len = `${url}${url.indexOf('?') < 0 ? '?' : '&'}${encodeURIComponent(JSON.stringify(data))}`.length;

  if (len < 2083) {
    imgRequest(url, data);
  } else if (!!navigator.sendBeacon) {
    sendBeacon(url, data);
  } else {
    sendAjax(url, data);
  }
};

// TODO
export const createUploader = (config?: any): UploadHandler => {
  return data => {};
};
