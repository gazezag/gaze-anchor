export const curry = (fn: Function, ...args: Array<any>) => {
  const _args = args || [];
  const { length } = fn;

  return (...rest: Array<any>) => {
    const _allArgs = _args.slice(0);
    // deep copy to prevent the side-effects
    _allArgs.push(...rest);

    if (_allArgs.length < length) {
      // rreturn currying function while the parameters are insufficient
      return curry.call(this, fn, ..._allArgs);
    }
    // call the function while sufficient parameters are obtained
    return fn.apply(this, _allArgs);
  };
};

export const promisify =
  (fn: Function) =>
  (...rest: Array<any>) =>
    new Promise((resolve, reject) => {
      fn.length === rest.length
        ? resolve(fn.apply(this, rest)) // may need to handle panic with try-catch
        : reject(new Error(`expect ${fn.length} arguments but got ${rest.length}`));
    });
