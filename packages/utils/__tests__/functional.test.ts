import { curry, promisify } from '../functional';

describe('functional.ts', () => {
  describe('curry', () => {
    const add = (a: number, b: number, c: number) => {
      return a + b + c;
    };
    const curryAdd = curry(add);
    const addOne = curryAdd(1);
    const addTwo = curry(add, 2);

    test('does not affect the original function', () => {
      expect(curryAdd(1)(2)(3)).toBe(6);
    });

    test('fixed parameters', () => {
      expect(addOne(2)(3)).toBe(6);
      expect(addOne(2, 3)).toBe(6);

      expect(addTwo(1)(3)).toBe(6);
      expect(addTwo(1, 3)).toBe(6);
    });

    test('get a function with insufficient parameters', () => {
      expect(typeof addOne()).toStrictEqual('function');
      expect(typeof addOne(2)).toStrictEqual('function');
      expect(typeof addOne(2)(3)).not.toBe('function');
    });
  });

  describe('promisify', () => {
    const fn = (a: number, b: number): number => a + b;
    const pmFn = promisify(fn);

    test('return a function with return a promise', () => {
      const isPromise = (obj: any) => {
        return !!obj && (typeof obj === 'object' || typeof obj === 'function') && typeof obj.then === 'function';
      };

      expect(typeof pmFn).toStrictEqual('function');
      expect(isPromise(pmFn(1, 2))).toBeTruthy();
    });

    test('the execution result will not be changed', async () => {
      const res = await pmFn(1, 2);
      expect(res).toBe(fn(1, 2));
    });

    test('reject the error when arguments not enough', () => {
      pmFn(1).catch(err => {
        expect(err).toStrictEqual(new Error('expect 2 arguments but got 1'));
      });
    });
  });
});
