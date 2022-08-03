import { PerformanceInfo, PerformanceInfoObj } from 'types/performanceIndex';
import { PerformanceInfoType } from './static';

export class Store {
  private status: Map<PerformanceInfoType, PerformanceInfo>;

  constructor() {
    this.status = new Map();
  }

  has(name: PerformanceInfoType): boolean {
    return this.status.has(name);
  }

  set(name: PerformanceInfoType, value: PerformanceInfo) {
    this.status.set(name, value);
  }

  get(name: PerformanceInfoType): PerformanceInfo | null {
    return this.has(name) ? (this.status.get(name) as PerformanceInfo) : null;
  }

  clear() {
    this.status.clear();
  }

  getAll(): PerformanceInfoObj {
    return Array.from(this.status).reduce((o, [k, v]) => {
      // use reflect because it panics with o[k] = v
      Reflect.set(o, k, v);
      return o;
    }, {});
  }
}

export const createStore = (): Store => new Store();
