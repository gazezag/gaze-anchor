export const getKeys = (o: Object): Array<PropertyKey> => Reflect.ownKeys(o);

export const has = (o: Object, k: PropertyKey): boolean => Reflect.has(o, k);

export const get = (o: Object, k: PropertyKey): any => {
  if (has(o, k)) {
    return Reflect.get(o, k);
  }

  throw new Error(`${k.toString()} not exist`);
};

export const del = (o: Object, k: PropertyKey): boolean => Reflect.deleteProperty(o, k);

// can clear the sdie-effect
export const set = (o: Object, k: PropertyKey, v: any): boolean => Reflect.set(o, k, v);

export const del = (o: Object, k: PropertyKey): boolean => Reflect.deleteProperty(o, k);

export const isEmpty = (data: any) => {
  if (Array.isArray(data)) {
    return data.length === 0;
  } else if (data instanceof Object) {
    return getKeys(data).length === 0;
  } else {
    return !!data;
  }
};
