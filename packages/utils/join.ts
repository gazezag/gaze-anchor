export const join = (p1: string, p2: string) => {
  if (p1.at(-1) === '/' && p2.at(0) === '/') {
    return `${p1}${p2.slice(1)}`;
  } else if (p1.at(-1) === '/' || p2.at(0) === '/') {
    return `${p1}${p2}`;
  } else {
    return `${p1}/${p2}`;
  }
};
