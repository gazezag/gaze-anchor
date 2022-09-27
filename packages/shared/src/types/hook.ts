export type HookCallback<T = null> = (...param: T[]) => void | boolean;

type Hook = (hookCallback: HookCallback) => void;

export interface Hooks {
  onInstalled: Hook;
  onBeforeUpload: Hook;
  onUploaded: Hook;
}
