import { curry } from '../functional';

describe('test curry', () => {
  const add = (a: number, b: number, c: number) => {
    return a + b + c;
  };
  const curryAdd = curry(add);
  const addOne = curryAdd(1);
  const addTwo = curryAdd(2);

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
    expect(typeof addOne()).toBe('function');
    expect(typeof addOne(2)).toBe('function');
    expect(typeof addOne(2)(3)).not.toBe('function');
  });
});
