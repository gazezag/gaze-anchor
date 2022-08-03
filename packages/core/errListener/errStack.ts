// 错误堆栈
const FULL_MATCH =
  /^\s*at (?:(.*?) ?\()?((?:file|https?|blob|chrome-extension|address|native|eval|webpack|<anonymous>|[-a-z]+:|.*bundle|\/).*?)(?::(\d+))?(?::(\d+))?\)?\s*$/i;

//! 最好不要在这里硬编码, 可以通过接受 config 来配置
// 限制只追溯10个
const STACKTRACE_LIMIT = 10;

//! 这里应该封装一个 type 来约束一下返回值会比较好, 因为估摸着其他地方也会用到这里的类型
// 解析每一行
export function parseStackLine(line: string) {
  const lineMatch = line.match(FULL_MATCH);
  if (!lineMatch) return {};

  const filename = lineMatch[2];
  const functionName = lineMatch[1] || '';
  const lineno = parseInt(lineMatch[3], 10) || undefined;
  const colno = parseInt(lineMatch[4], 10) || undefined;

  return {
    filename,
    functionName,
    lineno,
    colno
  };
}

//! 这里应该封装一个 type 来约束一下返回值会比较好, 因为估摸着其他地方也会用到这里的类型
// 解析错误堆栈
export function parseStackFrames(error: Error) {
  const { stack } = error;
  if (!stack) return [];

  const frames = [];
  for (const line of stack.split('\n').slice(1)) {
    const frame = parseStackLine(line);
    if (frame) {
      frames.push(frame);
    }
  }

  //! 这里可以优化, 直接按照限制的追溯步数来解析指定步数的 error stack 就可以了
  //! 没必要全部解析完了再 slice
  return frames.slice(0, STACKTRACE_LIMIT);
}
