/**
 * @description 替换DomString内的指定字符
 * @param {str}: 字符源
 * @param {target}:目标字符
 * @param {fillText}: 填充字符
 * @param {idx}: 第n次出现的
 */
export const regExpReplacer = (str, target, fillText, idx) => {
  let count = 0;
  return str.replace(new RegExp(target, "g"), p => {
    count++;
    return count == idx ? fillText : target;
  });
};
/**
 *
 * @description 增加view上指定class
 * @param {itemClass} className
 * @param {view} view
 */

export const addClass = (itemClass, view) => {
  const { editing } = window.editor;
  editing.view.change(writer => {
    writer.addClass(itemClass, view);
  });
};

/**
 * @description 删除view上指定class
 * @param {itemClass} className
 * @param {view} view
 */
export const removeClass = (itemClass, view) => {
  const { editing } = window.editor;
  editing.view.change(writer => {
    console.log(itemClass, view);
    writer.removeClass(itemClass, view);
  });
};

/**
 * @description 通过范围删除指定元素
 * @param {range} range
 */
export const removeElement = range => {
  const { model } = window.editor;
  model.change(writer => {
    console.log(range);
    writer.remove(range);
  });
};
