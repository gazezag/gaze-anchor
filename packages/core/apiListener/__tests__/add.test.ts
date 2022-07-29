/**
 * @Author: Ethan Teng
 * @Date: 2022-07-29 12:19:34
 * @LastEditTime: 2022-07-29 13:27:59
 * @Description:
 */

import { add } from 'core/apiListener';

test('1 plus 2 equals three', () => {
  expect(add(1, 2)).toEqual({ res: 3 });
});
