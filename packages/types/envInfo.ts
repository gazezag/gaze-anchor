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
  origin: string;
  url: string;
  title: string;
  referer: string;

  os: MetaInfo<OSType>;
  browser: MetaInfo<BrowserType>;

  language: string;
  network: string;
}
