export const roundOff = (num: number, range = 3): number => {
  return Number.parseFloat(num.toFixed(range));
};
