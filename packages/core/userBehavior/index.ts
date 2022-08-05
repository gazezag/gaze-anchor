import { GazeConfig } from 'types/gaze';
import { UserBehavior } from 'types/userBehavior';

export class UserBehaviorInfo {
  private breadcrumbs: UserBehavior;

  constructor(config: GazeConfig) {
    this.breadcrumbs = [];
  }
}
