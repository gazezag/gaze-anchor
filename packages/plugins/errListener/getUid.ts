import { uid } from 'packages/plugins/errListener/types/errorInfo';

export const getUid = (input: string): uid => {
  return window.btoa(encodeURIComponent(input)).slice(0, 255);
};
