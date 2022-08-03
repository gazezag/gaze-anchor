export const getKeys = (o: Object): Array<PropertyKey> => {
  return Reflect.ownKeys(o);
};

export const has = (o: Object, k: PropertyKey): boolean => {
  return Reflect.has(o, k);
};

export const get = (o: Object, k: PropertyKey): any => {
  if (has(o, k)) {
    return Reflect.get(o, k);
  }

  throw new Error(`${k.toString()} not exist`);
};

// can clear the sdie-effect
export const set = (o: Object, k: PropertyKey, v: any): boolean => {
  return Reflect.set(o, k, v);
};
