export const isNumber = (data: any) => {
  return typeof data === 'number';
};

export const isString = (data: any) => {
  return typeof data === 'string';
};

export const isArray = (data: any) => {
  return Array.isArray(data);
};
