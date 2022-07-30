// String.prototype.match() can return null
// and it's annoying with ts.......
export const getMatched = (
  src: string,
  reg: RegExp,
  idx: number = 1
): string => {
  const matched = src.match(reg);
  return matched ? matched[idx] : '';
};

export const getTestStrFn = (src: string) => {
  // match multiple regular express
  // and return true as soon as one test passes
  return (reg: RegExp | Array<RegExp>): boolean => {
    if (Array.isArray(reg)) {
      reg.map(v => {
        if (v.test(src)) {
          return true;
        }
      });
      return false;
    } else {
      return reg.test(src);
    }
  };
};
