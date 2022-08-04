export enum OSType {
  Windows = 'Windows',
  MacOS = 'MacOs',
  Linux = 'Linux',
  Unknown = 'Unknow'
}

export enum BrowserType {
  Chrome = 'Chrome',
  Safari = 'Safari',
  Edge = 'Edge',
  IE = 'IE',
  Firefox = 'Firefox',
  Opera = 'Opera',
  Unknown = 'Unknown'
}

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
