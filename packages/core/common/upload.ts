import { Uploader } from 'types/uploader';
import { get, has, set } from 'utils/reflect';
import { getNow } from 'utils/timestampHandler';

const imgRequest = (url: string, data: any) => {
  if (!url || !data) return;

  const img = new Image();

  img.onerror = () => {
    ajaxRequest(url, data);
  };

  img.src = `${url}${url.indexOf('?') < 0 ? '?' : '&'}${encodeURIComponent(JSON.stringify(data))}`;
};

const beaconRequest = (url: string, data: any) => {
  if (!url || !data) return;

  navigator.sendBeacon(
    url,
    new Blob([JSON.stringify(data)], {
      type: 'application/x-www-form-urlencoded'
    })
  );
};

const ajaxRequest = (url: string, data: any) => {
  if (!url || !data) return;

  // send ajax request with native XMLHttpRequest
  const xhr = get(window, has(window, 'nativeXhr') ? 'nativeXhr' : 'XMLHttpRequest');

  const client = new xhr();
  client.open('POST', url, true);
  client.setRequestHeader('Content-Type', 'application/json; charset=utf-8');
  client.send(JSON.stringify(data));
};

const join = (p1: string, p2: string) => {
  if (p1.at(-1) === '/' && p2.at(0) === '/') {
    return `${p1}${p2.slice(1)}`;
  } else if (p1.at(-1) === '/' || p2.at(0) === '/') {
    return `${p1}${p2}`;
  } else {
    return `${p1}/${p2}`;
  }
};

export const createUploader =
  (baseUrl: string): Uploader =>
  (path: string, data: any) => {
    const base = join(baseUrl, path);
    let url = join(base, 'empty.gif');

    const len = `${url}${url.indexOf('?') < 0 ? '?' : '&'}${encodeURIComponent(
      JSON.stringify(data)
    )}`.length;

    has(data, 'time') || set(data, 'time', getNow());

    // 2083 compatible with ie browser
    // chrome 8182
    // safari 80000
    // firefox 65536
    // opera 190000
    if (len < 2083) {
      imgRequest(url, data);
      // TODO bug here
      // } else if (isBeaconSupported()) {
      //   beaconRequest(join(base, 'add'), data);
    } else {
      ajaxRequest(join(base, 'add'), data);
    }
  };
