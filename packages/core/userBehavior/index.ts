import { GazeConfig } from 'types/gaze';
import { BehaviorItem } from 'types/userBehavior';

export class UserBehaviorInfo {
  private breadcrumbs: Array<BehaviorItem>;

  constructor(config: GazeConfig) {
    this.breadcrumbs = [];
  }
}
