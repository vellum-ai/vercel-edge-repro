/** Group an array of items by a key
 * @param array The array of items to group
 * @param key A function that returns the key to group by
 * @returns An object where the keys are the groups and the values are the items in that group
 * @example
 * const items = [
 *  { name: 'Alice', age: 30 },
 *  { name: 'Bob', age: 25 },
 *  { name: 'Charlie', age: 30 }]
 *  groupBy(items, item => item.age) // {30: [{name: 'Alice', age: 30}, {name: 'Charlie', age: 30}], 25:[{name: 'Bob', age: 25}]}
 * */
export const groupBy = <T, K extends string | number | symbol>(
  array: T[],
  key: (item: T) => K,
) =>
  array.reduce(
    (acc, item) => {
      const group = key(item);
      if (!acc[group]) {
        acc[group] = [];
      }
      acc[group].push(item);
      return acc;
    },
    {} as Record<K, T[]>,
  );
