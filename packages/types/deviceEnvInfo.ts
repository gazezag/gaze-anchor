import { BrowserType, OSType } from 'core/common';

export interface MetaInfo<T> {
  type: T;
  version: string;
}

export interface DeviceEnvInfo {
  origin: string;
  url: string;
  title: string;
  referer: string;

  os: MetaInfo<OSType>;
  browser: MetaInfo<BrowserType>;

  language: string;
  network: string;
}
