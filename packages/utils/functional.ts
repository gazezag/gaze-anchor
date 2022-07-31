export const curry = (fn: Function, ...args: Array<any>) => {
  const _args = args || [];
  const length = fn.length;

  return (...rest: Array<any>) => {
    const _allArgs = _args.slice(0);
    // deep copy to prevent the side-effects
    _allArgs.push(...rest);

    if (_allArgs.length < length) {
      // rreturn currying function while the parameters are insufficient
      return curry.call(this, fn, ..._allArgs);
    } else {
      // call the function while sufficient parameters are obtained
      return fn.apply(this, _allArgs);
    }
  };
};
