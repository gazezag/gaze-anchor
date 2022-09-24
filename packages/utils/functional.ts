export const curry = (fn: Function) => {
  const inner = (...args: Array<any>) =>
    args.length === fn.length ? fn(...args) : (...cur: Array<any>) => inner(...args, ...cur);

  return inner;
};

export const promisify =
  (fn: Function) =>
  (...args: Array<any>) =>
    new Promise((resolve, reject) => {
      fn.length === args.length
        ? resolve(fn(...args)) // may need to handle panic with try-catch
        : reject(new Error(`expect ${fn.length} arguments but got ${args.length}`));
    });
