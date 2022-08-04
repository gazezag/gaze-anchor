import { set } from 'utils/reflect';

//! 此处为了灵活性, 将 Store 中所有字段设为泛型
//! K 为 map 的键值类型
//! V 为 map 中存储的值的类型
//! 使用时需指定
//! e.g
//!     const store = new Store<string, number>()
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
    return Array.from(this.status).reduce((o, [k, v]) => {
      // use reflect because it panics with o[k] = v
      set(o, k, v);
      return o;
    }, {});
  }
}
