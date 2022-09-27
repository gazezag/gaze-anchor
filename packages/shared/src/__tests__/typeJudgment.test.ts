import { isNumber, isString, isArray } from '../typeJudgment';

describe('test isNumber', () => {
  test('1 is a number', () => {
    expect(isNumber(1)).toBeTruthy();
  });

  test('"1" is not a number', () => {
    expect(isNumber('1')).toBeFalsy();
  });
});

describe('test isString', () => {
  test('"1" is a string', () => {
    expect(isString('1')).toBeTruthy();
  });

  test('1 is not a string', () => {
    expect(isString(1)).toBeFalsy();
  });
});

describe('test isArray', () => {
  test('[] is a array', () => {
    expect(isArray([])).toBeTruthy();
  });

  test('[1] is a array', () => {
    expect(isArray([1])).toBeTruthy();
  });

  // I don't know how to judge a data is array or not
  test('object with iterator is not a array', () => {
    const arrayLikeObj = {
      idx: 0,
      length: 2,

      0: 1,
      1: 2,

      *[Symbol.iterator]() {
        while (this.idx < this.length) {
          yield this.idx++;
        }
      }
    };

    expect(isArray(arrayLikeObj)).toBeFalsy();
  });
});
