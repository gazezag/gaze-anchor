import { BehaviorType, createBehaviorInfoUploader, Store } from 'core/common';
import { BehaviorCaptureConfig } from 'types/gaze';
import { BehaviorInfoUploader } from 'types/uploader';
import { UserBehavior } from 'types/userBehavior';
import { initPV, initRouterProxy, initHttpProxy, initOperationListener } from './behaviorIndex';

export class UserBehaviorObserver {
  private store: Store<BehaviorType, UserBehavior>;
  private uploader: BehaviorInfoUploader;
  private immediately: boolean;

  constructor(config: BehaviorCaptureConfig) {
    const { uploadImmediately, duration } = config;

    this.store = new Store();
    this.uploader = createBehaviorInfoUploader(this.store, duration!);
    this.immediately = uploadImmediately!;
  }

  init() {
    initPV(this.uploader);

    initRouterProxy(this.store, this.uploader, this.immediately);
    initHttpProxy(this.store, this.uploader, this.immediately);
    initOperationListener(this.store, this.uploader, this.immediately);
  }
}
