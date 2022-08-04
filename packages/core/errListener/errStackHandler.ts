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
  //! 用闭包缓存 reg
  //! 其实这里也可以柯里化 parseStackLine 固定 reg...
  const reg =
    /^\s*at (?:(.*?) ?\()?((?:file|https?|blob|chrome-extension|address|native|eval|webpack|<anonymous>|[-a-z]+:|.*bundle|\/).*?)(?::(\d+))?(?::(\d+))?\)?\s*$/i;

  return ({ stack }: Error): Array<ErrorStep> => {
    return stack
      ? stack //! stack 存在则进行处理
          .split('\n')
          .slice(1)
          .reduce((prev: Array<ErrorStep>, line) => {
            const res = parseStackLine(line, reg);
            //! res 存在则压栈
            res && prev.push(res);

            return prev;
          }, [])
          //! 返回指定大小的切片
          //! 其实我记得是有个黑科技可以提前跳出 reduce 迭代的
          //! 但是感觉没必要
          .slice(0, limit)
      : []; //! stack 不存在则返回空数组
  };
};

//! 最好不要在这里硬编码, 可以通过接受 config 来配置
// // 限制只追溯10个
// const STACKTRACE_LIMIT = 10;

//! 这里应该封装一个 type 来约束一下返回值会比较好, 因为估摸着其他地方也会用到这里的类型
// 解析每一行
// export function parseStackLine(line: string) {
//   const lineMatch = line.match(FULL_MATCH);
//   if (!lineMatch) return {};

//   const filename = lineMatch[2];
//   const functionName = lineMatch[1] || '';
//   const lineno = parseInt(lineMatch[3], 10) || undefined;
//   const colno = parseInt(lineMatch[4], 10) || undefined;

//   return {
//     filename,
//     functionName,
//     lineno,
//     colno
//   };
// }

//! 这里应该封装一个 type 来约束一下返回值会比较好, 因为估摸着其他地方也会用到这里的类型
// 解析错误堆栈
// export function parseStackFrames(error: Error) {
//   const { stack } = error;
//   if (!stack) return [];

//   const frames = [];
//   for (const line of stack.split('\n').slice(1)) {
//     const frame = parseStackLine(line);
//     if (frame) {
//       frames.push(frame);
//     }
//   }

//   //! 这里可以优化, 直接按照限制的追溯步数来解析指定步数的 error stack 就可以了
//   //! 没必要全部解析完了再 slice
//   return frames.slice(0, STACKTRACE_LIMIT);
// }
