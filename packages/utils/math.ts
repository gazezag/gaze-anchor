export const roundOff = (num: number, range: number = 3): number => {
  return Number.parseFloat(num.toFixed(range));
};
