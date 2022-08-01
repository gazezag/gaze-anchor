import { BrowserType, DeviceEnvInfo, OSType } from 'types/deviceEnvInfo';
import { UploadHandler } from 'types/uploader';
import { isNavigatorSupported, isPerformanceSupported } from 'utils/compatible';
import { getMatched, getTestStrFn } from 'utils/index';
import { PerformanceInfoType } from 'core/common/static';
import { Store } from 'core/common/store';

type BrowserInfoEnum = Array<{
  type: BrowserType;
  flag: boolean;
  version: string;
}>;

type GetMetaInfoFn<T> = (ua: string) => { type: T; version: string };

const getBrowser: GetMetaInfoFn<BrowserType> = ua => {
  const typeEnum: BrowserInfoEnum = [
    {
      type: BrowserType.Chrome,
      flag: ua.indexOf('Chrome') > -1 || ua.indexOf('CriOS') > -1,
      version: getMatched(ua, /Chrome\/([\d.]+)/, 1)
    },
    {
      type: BrowserType.Safari,
      flag: ua.indexOf('Safari') > -1 && ua.indexOf('Chrome') === -1,
      version: getMatched(ua, /Version\/([\d.]+)/, 1)
    },
    {
      type: BrowserType.Edge,
      flag: ua.indexOf('Edge') > -1,
      version: getMatched(ua, /Edge\/([\d.]+)/, 1)
    },
    {
      type: BrowserType.IE,
      flag: ua.indexOf('compatible') > -1 && ua.indexOf('MSIE') > -1,
      version: getMatched(ua, /(MSIE\s|Trident.*rv:)([\w.]+)/, 2)
    },
    {
      type: BrowserType.Firefox,
      flag: ua.indexOf('Firefox') > -1,
      version: getMatched(ua, /Firefox\/([\d.]+)/, 1)
    },
    {
      type: BrowserType.Opera,
      flag: ua.indexOf('Opera') > -1 || ua.indexOf('OPR') > -1,
      version: getMatched(ua, /Opera\/([\d.]+)/, 1)
    }
  ];

  typeEnum.map(v => {
    if (v.flag) {
      return {
        type: v.type,
        version: v.version
      };
    }
  });

  return {
    type: BrowserType.Unknown,
    version: ''
  };
};

const getOS: GetMetaInfoFn<OSType> = ua => {
  const testUA = getTestStrFn(ua);

  return {
    type: testUA([/compatible/i, /Windows/i])
      ? OSType.Windows
      : testUA([/Macintosh/i, /MacIntel/i])
      ? OSType.MacOS
      : testUA(/Ubuntu/i)
      ? OSType.Linux
      : OSType.Unknown,

    //TODO no idea to get the detailed version number for the time being...
    version: ''
  };
};

const getDeviceInfo = (): DeviceEnvInfo | undefined => {
  if (!isPerformanceSupported()) {
    console.error('browser do not support performance');
    return;
  }
  if (!isNavigatorSupported()) {
    console.error('browser do not support navigator');
    return;
  }

  const { navigator: nvg, location: loc, document: doc } = window;

  return {
    origin: loc.origin,
    url: loc.href,
    title: doc.title,
    referer: doc.referrer,

    os: getOS(nvg.userAgent),
    browser: getBrowser(nvg.userAgent),

    language: nvg.language,
    network: nvg.connection.type // problem here
  };
};

export const initDeviceInfo = (store: Store, upload: UploadHandler, immediately = true) => {
  const deviceInfo = getDeviceInfo();
  if (deviceInfo) {
    const value = {
      type: PerformanceInfoType.DI,
      value: deviceInfo
    };

    store.set(PerformanceInfoType.DI, value);

    immediately && upload(value);
  }
};
