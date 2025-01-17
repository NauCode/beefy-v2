import { isArray, isPlainObject, mapValues, sortBy } from 'lodash';
import { BIG_ZERO } from '../../../helpers/big-number';
import BigNumber from 'bignumber.js';
import { KeysOfType } from './types-utils';

// https://github.com/lodash/lodash/issues/1244#issuecomment-356676695
export const mapValuesDeep = (obj: any, fn: (val: any, key: string, obj: any) => any) =>
  isArray(obj)
    ? obj.map(item => mapValuesDeep(item, fn))
    : mapValues(obj, (val, key) =>
        isPlainObject(val) || isArray(val) ? mapValuesDeep(val, fn) : fn(val, key, obj)
      );

export function createIdMap<T extends { id: string }>(
  arr: T[],
  getId: (item: T) => string = item => item.id
) {
  return arr.reduce((agg, item) => {
    agg[getId(item)] = item;
    return agg;
  }, {} as { [id: string]: T });
}

//https://github.com/lodash/lodash/issues/2339#issuecomment-585615971
export const intersperse = <T>(arr: T[], separator: (n: number) => T): T[] =>
  arr.reduce<T[]>((acc, currentElement, currentIndex) => {
    const isLast = currentIndex === arr.length - 1;
    return [...acc, currentElement, ...(isLast ? [] : [separator(currentIndex)])];
  }, []);

type BaseEntry = {
  key: string;
  value: BigNumber;
  percentage: number;
};

export function getTop6Array<T extends BaseEntry>(
  arry: T[],
  key: KeysOfType<T, string | number>
): BaseEntry[] {
  const sortedArray = sortBy(arry, [key]).reverse();

  if (sortedArray.length <= 6) {
    return sortedArray;
  }

  const other: BaseEntry = sortedArray.slice(5, sortedArray.length).reduce(
    (tot, cur) => {
      tot.value = tot.value.plus(cur.value);
      tot.percentage += cur.percentage;
      return tot;
    },
    { key: 'others', value: BIG_ZERO, percentage: 0 }
  );

  const top: BaseEntry[] = sortedArray.slice(0, 5);
  top.push(other);
  return top;
}
