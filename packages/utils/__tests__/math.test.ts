import { roundOff } from '../math';

describe('test roundOff', () => {
  const getDigits = (num: number): number => {
    const numStr = String(num);
    const pos = numStr.indexOf('.') + 1;
    return pos ? numStr.length - pos : 0;
  };

  test('test getDigits', () => {
    expect(getDigits(1.1234)).toBe(4);
    expect(getDigits(1111)).toBe(0);
  });

  test('get 1.123 with 1.123456', () => {
    const res = roundOff(1.123456);
    expect(res).toBe(1.123);
  });
});
