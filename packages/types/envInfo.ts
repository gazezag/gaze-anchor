export enum OSType {
  Windows,
  MacOS,
  Linux,
  Unknown
}

export enum BrowserType {
  Chrome,
  Safari,
  Edge,
  IE,
  Firefox,
  Opera,
  Unknown
}

export interface MetaInfo<T> {
  type: T;
  version: string;
}

export interface EnvInfo {
  url: string;
  os: MetaInfo<OSType>;
  browser: MetaInfo<BrowserType>;
}
