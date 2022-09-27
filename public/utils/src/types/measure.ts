export interface CustomMeasure {
  description: string;
  startTime: number;
  duration: number;
}

export type Once = boolean;
export interface MeasureOptions {
  once?: boolean;
  roundOff?: number;
}
