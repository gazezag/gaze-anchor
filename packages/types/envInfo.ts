export interface EnvInfo {
  url: string;
  os: {
    type: 'Windows' | 'Mac OS' | 'Linux';
    version: string;
  };
  browser: {
    type: string;
    version: string;
  };
}
