export interface PerformanceCaptureConfig {
  uploadImmediately?: boolean;
  duration?: number;
}

export interface ErrorCaptureConfig {
  uploadImmediately?: boolean;
  duration?: number;
  logErrors?: boolean;
  stackLimit?: number;
}

export interface BehaviorCaptureConfig {
  uploadImmediately?: boolean;
  duration?: number;
}

export interface GazeConfig {
  target: string;
  token?: string;
  release?: string;
  performance?: PerformanceCaptureConfig;
  error?: ErrorCaptureConfig;
  behavior?: BehaviorCaptureConfig;
}
