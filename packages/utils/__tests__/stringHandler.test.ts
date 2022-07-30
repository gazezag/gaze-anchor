import { getMatched, getTestStrFn } from '../stringHandler';

describe('test getMatched', () => {
  test('get empty string if nothing was matched', () => {
    expect(getMatched('foo', /bar/)).toBe('');
  });

  test('get matched string if match successfull', () => {
    expect(getMatched('foo', /foo/)).toBe('foo');
    expect(getMatched('barfoobar', /foo/)).toBe('foo');
  });

  test('greedy matching', () => {
    expect(getMatched('foobarfoo', /foo/)).toBe('foo');
  });
});

describe('test getTestStrFn', () => {
  const testFn = getTestStrFn('foo bar foo bar foo bar');

  test('return false if nothing was matched', () => {
    expect(testFn(/hello world/)).toBeFalsy();
    expect(testFn([/hello/, /world/])).toBeFalsy();
  });

  test('return true if each one express was metched', () => {
    expect(testFn(/foo/)).toBeTruthy();
    expect(testFn(/bar/)).toBeTruthy();
    expect(testFn([/foo/, /bar/])).toBeTruthy();
    expect(testFn([/foo/, /hello world/])).toBeTruthy();
    expect(testFn([/hello world/, /foo/])).toBeTruthy();
  });
});
