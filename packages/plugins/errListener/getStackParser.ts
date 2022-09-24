import { ErrorStep, StackParser } from 'packages/plugins/errListener/types/errorInfo';

/**
 * @descript parse single line error message
 * @param { string } line error message line to be parsed
 * @param { RegExp } reg regular expressions used to process error message
 * @return { ErrorStep }
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
 * @descript get a function to parse the error messages stack
 *          and here had been currying to fix the parameter 'limit'
 * @param { number } limit maximum length of parsed messages
 * @return { (Error) => Array<ErrorStep> } anonymous function
 */
export const getStackParser = (limit: number): StackParser => {
  const reg =
    /^\s*at (?:(.*?) ?\()?((?:file|https?|blob|chrome-extension|address|native|eval|webpack|<anonymous>|[-a-z]+:|.*bundle|\/).*?)(?::(\d+))?(?::(\d+))?\)?\s*$/i;

  return ({ stack }) => {
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
