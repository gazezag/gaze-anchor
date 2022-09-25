export const isNumber = (data: any) => typeof data === 'number';

export const isString = (data: any) => typeof data === 'string';

export const isObject = (data: any) => data && typeof data === 'object';

export const isArray = (data: any) => Array.isArray(data);

export const isBoolean = (data: any) => typeof data === 'boolean';
