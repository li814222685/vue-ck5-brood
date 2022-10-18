/**
 * @description 替换DomString内的指定字符
 * @params str: 字符源
 * @params target:目标字符
 * @params fillText: 填充字符
 * @params idx: 第n次出现的
 */
export const regExpReplacer = (str, target, fillText, idx) => {
  let count = 0;
  return str.replace(new RegExp(target, "g"), p => {
    count++;
    return count == idx ? fillText : target;
  });
};
