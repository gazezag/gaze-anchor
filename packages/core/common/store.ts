import { set } from 'utils/reflect';

export class Store<K extends PropertyKey, V> {
  private status: Map<K, V>;

  constructor() {
    this.status = new Map();
  }

  has(name: K): boolean {
    return this.status.has(name);
  }

  set(name: K, value: V) {
    this.status.set(name, value);
  }

  get(name: K): V | null {
    return this.has(name) ? (this.status.get(name) as V) : null;
  }

  clear() {
    this.status.clear();
  }

  getAll(): { [name: string]: V } {
    const res = Array.from(this.status).reduce((o, [k, v]) => {
      // use reflect because it panics with o[k] = v
      set(o, k, v);
      return o;
    }, {});

    this.clear();

    return res;
  }
}
