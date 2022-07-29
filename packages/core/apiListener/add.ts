/**
 * @Author: Ethan Teng
 * @Date: 2022-07-29 11:06:35
 * @LastEditTime: 2022-07-29 12:19:13
 * @Description:
 */
import { AType } from 'types/aType';

export const add = (a: number, b: number): AType => {
  return {
    res: a + b
  };
};
