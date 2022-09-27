import { getStackParser } from '../errStackHandler';

describe('errStack.ts', () => {
  describe('getStackParser', () => {
    const stackParser1 = getStackParser(1);
    const stackParser10 = getStackParser(10);
    const mockErr = new Error('This is a error');

    test('return a function', () => {
      expect(typeof stackParser1 === 'function').toBeTruthy();
      expect(typeof stackParser10 === 'function').toBeTruthy();
    });

    test('parser return a array', () => {
      expect(Array.isArray(stackParser1(mockErr))).toBeTruthy();
    });

    test('items in array has some fields', () => {
      const res = stackParser1(mockErr)[0];
      expect(Reflect.has(res, 'filename')).toBeTruthy();
      expect(Reflect.has(res, 'functionName')).toBeTruthy();
      expect(Reflect.has(res, 'line')).toBeTruthy();
      expect(Reflect.has(res, 'col')).toBeTruthy();
    });

    test('test the type of items', () => {
      const res = stackParser1(mockErr)[0];
      expect(typeof res.filename === 'string').toBeTruthy();
      expect(typeof res.functionName === 'string').toBeTruthy();
      expect(typeof res.line === 'number').toBeTruthy();
      expect(typeof res.col === 'number').toBeTruthy();
    });

    test('will only get the specified length', () => {
      expect(stackParser1(mockErr).length).toBe(1);
      expect(stackParser10(mockErr).length).toBe(10);
    });
  });
});
