import { ErrorStep } from 'types/errorInfo';

/**
 * @descript 正则解析单行报错信息
 * @param {string} line
 * @param {RegExp} reg
 * @return {ErrorStep | null}
 */
const parseStackLine = (line: string, reg: RegExp): ErrorStep | null => {
  const matched = line.match(reg);

  return matched
    ? {
        filename: matched[2],
        functionName: matched[1] || '',
        line: parseInt(matched[3], 10),
        col: parseInt(matched[4], 10)
      }
    : null;
};

/**
 * @descript 获取解析错误信息栈的函数, 此处柯里化固定了 limit
 * @param {number} limit
 * @return {(Error) => Array<ErrorStep>} anonymous function
 */
export const getStackParser = (limit: number) => {
  const reg =
    /^\s*at (?:(.*?) ?\()?((?:file|https?|blob|chrome-extension|address|native|eval|webpack|<anonymous>|[-a-z]+:|.*bundle|\/).*?)(?::(\d+))?(?::(\d+))?\)?\s*$/i;

  return ({ stack }: Error): Array<ErrorStep> => {
    return stack
      ? stack 
          .split('\n')
          .slice(1)
          .reduce((prev: Array<ErrorStep>, line) => {
            const res = parseStackLine(line, reg);
            res && prev.push(res);

            return prev;
          }, [])
          .slice(0, limit)
      : []; 
  };
};

