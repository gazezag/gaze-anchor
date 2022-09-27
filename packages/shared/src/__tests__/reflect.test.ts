import { get, getKeys, has, set } from '../reflect';

describe('reflect.ts', () => {
  describe('geKeys', () => {
    const mockObj1 = {
      a: 1,
      b: 2
    };

    const mockObj2 = {
      a: 1,
      b: 2,

      [Symbol.match]() {}
    };

    test('return a array', () => {
      expect(Array.isArray(getKeys(mockObj1))).toBeTruthy();
    });

    test('return a empty array with empty object', () => {
      expect(getKeys({})).toStrictEqual([]);
    });

    test('include all the keys of the object', () => {
      expect(getKeys(mockObj1)).toStrictEqual(['a', 'b']);
    });

    test('include Symbol attributes', () => {
      expect(getKeys(mockObj2)).toStrictEqual(['a', 'b', Symbol.match]);
    });
  });

  describe('has', () => {
    const mockObj1 = {
      a: 1,
      b: 2
    };

    const mockObj2 = {
      a: 1,
      b: 2,

      [Symbol.match]() {}
    };

    test('return true when the key exist', () => {
      expect(has(mockObj1, 'a')).toBeTruthy();
    });

    test('return false when the key not exist', () => {
      expect(has(mockObj1, 'hello')).toBeFalsy();
    });

    test('can judge the Symbol key', () => {
      expect(has(mockObj2, Symbol.match)).toBeTruthy();
    });
  });

  describe('get', () => {
    const mockObj1 = {
      a: 1,
      b: 2
    };

    const mockObj2 = {
      a: 1,
      b: 2,

      [Symbol.match]() {}
    };

    test('get the value when key exist', () => {
      expect(get(mockObj1, 'a')).toBe(1);
    });

    test('throw error when key not exist', () => {
      expect(() => get(mockObj1, 'hello')).toThrow('hello not exist');
    });

    test('can get the Symbol attributes', () => {
      expect(String(get(mockObj2, Symbol.match))).toEqual('[Symbol.match]() { }');
    });
  });

  describe('set', () => {
    test('return true when modifiy successfully', () => {
      const mockObj = { a: 1, b: 2 };
      expect(set(mockObj, 'a', 2)).toBeTruthy();
      expect(mockObj.a).toBe(2);
    });

    test('return true when key exist', () => {
      const mockObj = { a: 1, b: 2 };
      expect(set(mockObj, 'hello', 1)).toBeTruthy();
      expect(get(mockObj, 'hello')).toBe(1);
    });
  });
});
