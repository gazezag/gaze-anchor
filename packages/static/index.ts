export enum EventType {
  // Error
  error = 'error',
  unhandledrejection = 'unhandledrejection',

  // User Operation
  click = 'click',
  dblClick = 'dblclick',
  keydown = 'keydown',
  // I still don't know why one is lower-camel-case and the other one is lowercase....
  pushState = 'pushState',
  popState = 'popstate',
  replaceState = 'replacestate',
  hashChange = 'hashchange',

  // Page
  pageshow = 'pageshow',
  load = 'load',
  beforeunload = 'beforeunload',
  visibilitychange = 'visibilitychange'
}

export enum LifeCycleHookTypes {
  BEFORE_INSTALL = 'beforeInstall',
  INSTALLED = 'installed',
  BEFOR_UPLOAD = 'beforeUpload',
  UPLOADED = 'uploaded'
}
