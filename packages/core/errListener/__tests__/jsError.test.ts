import { ErrorObserver } from '../index';

describe('errStack.ts', () => {
  describe('getStackParser', () => {
    // const stackParser1 = getStackParser(1);
    // const stackParser10 = getStackParser(10);
    
    test('测试1', () => {
      throw new Error("file not exist");
      const config =  {
        target: 'http://localhost:9000',
        token: '',
        stackLimit: 10,
        logErrors: false,
        release: ''
      }
  
      const jsError = new ErrorObserver(config)
      jsError.init()
      let store1 = jsError.store
      console.log(store1.status)
      expect(typeof store1 === 'object').toBeTruthy();
      // expect(typeof store1.status.info.message === 'string').toBeTruthy();
    });
  })


//     test('parser return a array', () => {
//       expect(Array.isArray(stackParser1(mockErr))).toBeTruthy();
//     });

//     test('items in array has some fields', () => {
//       const res = stackParser1(mockErr)[0];
//       expect(Reflect.has(res, 'filename')).toBeTruthy();
//       expect(Reflect.has(res, 'functionName')).toBeTruthy();
//       expect(Reflect.has(res, 'line')).toBeTruthy();
//       expect(Reflect.has(res, 'col')).toBeTruthy();
//     });

//     test('test the type of items', () => {
//       const res = stackParser1(mockErr)[0];
//       expect(typeof res.filename === 'string').toBeTruthy();
//       expect(typeof res.functionName === 'string').toBeTruthy();
//       expect(typeof res.line === 'number').toBeTruthy();
//       expect(typeof res.col === 'number').toBeTruthy();
//     });

//     test('will only get the specified length', () => {
//       expect(stackParser1(mockErr).length).toBe(1);
//       expect(stackParser10(mockErr).length).toBe(10);
//     });
//   });
});
