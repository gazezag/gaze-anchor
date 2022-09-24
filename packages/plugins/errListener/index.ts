import { uid } from 'packages/plugins/errListener/types/errorInfo';
import { getStackParser } from './getStackParser';
import { PluginDefineFunction } from 'types/plugin';
import { Config } from './types/config';
import {
  initCorsError,
  initHttpError,
  initJsError,
  initPromiseReject,
  initResourceError
} from './errorCatcher';

export const errorCatcherPlugin: PluginDefineFunction<Config> = options => {
  const { stackLimit } = options;
  const stackParser = getStackParser(stackLimit);
  const submitedErrorUids = new Set<uid>();

  return {
    install(uploader) {
      console.log('install errorcatcher!');

      initJsError(options, stackParser, submitedErrorUids, uploader);
      initPromiseReject(options, stackParser, submitedErrorUids, uploader);
      initResourceError(options, submitedErrorUids, uploader);
      initHttpError(submitedErrorUids, uploader);
      initCorsError(options, submitedErrorUids, uploader);
    }
  };
};
