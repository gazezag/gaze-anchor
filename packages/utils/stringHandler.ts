// String.prototype.match() can return null
// and it's annoying with ts.......
export const getMatched = (src: string, reg: RegExp, idx = 0): string => {
  const matched = src.match(reg);
  return matched ? matched[idx] : '';
};

export const getTestStrFn =
  (src: string) =>
  // match multiple regular express
  // and return true as soon as one test passes
  (reg: RegExp | Array<RegExp>): boolean => {
    if (Array.isArray(reg)) {
      for (const r of reg) {
        if (r.test(src)) return true;
      }
      return false;
    }
    return reg.test(src);
  };
