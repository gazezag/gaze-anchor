import { parseStackLine, parseStackFrames } from '../errStack';

describe('errStack.ts', () => {
  describe('parseStackLine', () => {});

  describe('parseStackFrames', () => {
    const mockErr = new Error('This is a error');

    test('', () => {
      // [
      //   {
      //     filename: '/Users/EthanTeng/Coding/projects/openSource/performance-monitor/gaze-anchor/packages/core/errListener/__tests__/errStack.test.ts',
      //     functionName: '',
      //     lineno: 7,
      //     colno: 21
      //   },
      //   {
      //     filename: '/Users/EthanTeng/Coding/projects/openSource/performance-monitor/gaze-anchor/node_modules/.pnpm/registry.npmmirror.com+jest-circus@28.1.3/node_modules/jest-circus/build/index.js',
      //     functionName: '_dispatchDescribe',
      //     lineno: 105,
      //     colno: 26
      //   },
      //   {
      //     filename: '/Users/EthanTeng/Coding/projects/openSource/performance-monitor/gaze-anchor/node_modules/.pnpm/registry.npmmirror.com+jest-circus@28.1.3/node_modules/jest-circus/build/index.js',
      //     functionName: 'describe',
      //     lineno: 60,
      //     colno: 5
      //   },
      //   {
      //     filename: '/Users/EthanTeng/Coding/projects/openSource/performance-monitor/gaze-anchor/packages/core/errListener/__tests__/errStack.test.ts',
      //     functionName: '',
      //     lineno: 6,
      //     colno: 3
      //   },
      //   {
      //     filename: '/Users/EthanTeng/Coding/projects/openSource/performance-monitor/gaze-anchor/node_modules/.pnpm/registry.npmmirror.com+jest-circus@28.1.3/node_modules/jest-circus/build/index.js',
      //     functionName: '_dispatchDescribe',
      //     lineno: 105,
      //     colno: 26
      //   },
      //   {
      //     filename: '/Users/EthanTeng/Coding/projects/openSource/performance-monitor/gaze-anchor/node_modules/.pnpm/registry.npmmirror.com+jest-circus@28.1.3/node_modules/jest-circus/build/index.js',
      //     functionName: 'describe',
      //     lineno: 60,
      //     colno: 5
      //   },
      //   {
      //     filename: '/Users/EthanTeng/Coding/projects/openSource/performance-monitor/gaze-anchor/packages/core/errListener/__tests__/errStack.test.ts',
      //     functionName: 'Object.<anonymous>',
      //     lineno: 3,
      //     colno: 1
      //   },
      //   {
      //     filename: '/Users/EthanTeng/Coding/projects/openSource/performance-monitor/gaze-anchor/node_modules/.pnpm/registry.npmmirror.com+jest-runtime@28.1.3/node_modules/jest-runtime/build/index.js',
      //     functionName: 'Runtime._execModule',
      //     lineno: 1714,
      //     colno: 24
      //   },
      //   {
      //     filename: '/Users/EthanTeng/Coding/projects/openSource/performance-monitor/gaze-anchor/node_modules/.pnpm/registry.npmmirror.com+jest-runtime@28.1.3/node_modules/jest-runtime/build/index.js',
      //     functionName: 'Runtime._loadModule',
      //     lineno: 1223,
      //     colno: 12
      //   },
      //   {
      //     filename: '/Users/EthanTeng/Coding/projects/openSource/performance-monitor/gaze-anchor/node_modules/.pnpm/registry.npmmirror.com+jest-runtime@28.1.3/node_modules/jest-runtime/build/index.js',
      //     functionName: 'Runtime.requireModule',
      //     lineno: 1047,
      //     colno: 12
      //   }
      // ]
    });

    test('', () => {
      // Error: This is a error
      // at /Users/EthanTeng/Coding/projects/openSource/performance-monitor/gaze-anchor/packages/core/errListener/__tests__/errStack.test.ts:7:21
      // at _dispatchDescribe (/Users/EthanTeng/Coding/projects/openSource/performance-monitor/gaze-anchor/node_modules/.pnpm/registry.npmmirror.com+jest-circus@28.1.3/node_modules/jest-circus/build/index.js:105:26)
      // at describe (/Users/EthanTeng/Coding/projects/openSource/performance-monitor/gaze-anchor/node_modules/.pnpm/registry.npmmirror.com+jest-circus@28.1.3/node_modules/jest-circus/build/index.js:60:5)
      // at /Users/EthanTeng/Coding/projects/openSource/performance-monitor/gaze-anchor/packages/core/errListener/__tests__/errStack.test.ts:6:3
      // at _dispatchDescribe (/Users/EthanTeng/Coding/projects/openSource/performance-monitor/gaze-anchor/node_modules/.pnpm/registry.npmmirror.com+jest-circus@28.1.3/node_modules/jest-circus/build/index.js:105:26)
      // at describe (/Users/EthanTeng/Coding/projects/openSource/performance-monitor/gaze-anchor/node_modules/.pnpm/registry.npmmirror.com+jest-circus@28.1.3/node_modules/jest-circus/build/index.js:60:5)
      // at Object.<anonymous> (/Users/EthanTeng/Coding/projects/openSource/performance-monitor/gaze-anchor/packages/core/errListener/__tests__/errStack.test.ts:3:1)
      // at Runtime._execModule (/Users/EthanTeng/Coding/projects/openSource/performance-monitor/gaze-anchor/node_modules/.pnpm/registry.npmmirror.com+jest-runtime@28.1.3/node_modules/jest-runtime/build/index.js:1714:24)
      // at Runtime._loadModule (/Users/EthanTeng/Coding/projects/openSource/performance-monitor/gaze-anchor/node_modules/.pnpm/registry.npmmirror.com+jest-runtime@28.1.3/node_modules/jest-runtime/build/index.js:1223:12)
      // at Runtime.requireModule (/Users/EthanTeng/Coding/projects/openSource/performance-monitor/gaze-anchor/node_modules/.pnpm/registry.npmmirror.com+jest-runtime@28.1.3/node_modules/jest-runtime/build/index.js:1047:12)
    });
  });
});
