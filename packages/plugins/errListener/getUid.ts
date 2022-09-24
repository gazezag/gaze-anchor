import { uid } from './types/errorInfo';

export const getUid = (input: string): uid => {
  return window.btoa(encodeURIComponent(input)).slice(0, 255);
};
