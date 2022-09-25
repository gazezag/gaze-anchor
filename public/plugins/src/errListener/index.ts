import { PluginDefineFunction } from 'shared-types';
import { uid } from './types/errorInfo';
import { Config } from './types/config';
import { getStackParser } from './getStackParser';
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
      initJsError(options, stackParser, submitedErrorUids, uploader);
      initPromiseReject(options, stackParser, submitedErrorUids, uploader);
      initResourceError(options, submitedErrorUids, uploader);
      initHttpError(submitedErrorUids, uploader);
      initCorsError(options, submitedErrorUids, uploader);
    }
  };
};
