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
  const { editing } = window.editor || window.devEditor;

  console.log(
    "%c🍉Lee%cline:36%cview",
    "color:#fff;background:#ee6f57;padding:3px;border-radius:2px",
    "color:#fff;background:#1f3c88;padding:3px;border-radius:2px",
    "color:#fff;background:rgb(254, 67, 101);padding:3px;border-radius:2px",
    view
  );
  editing.view.change(writer => {
    writer.removeClass(itemClass, view);
  });
};

/**
 * @description 通过范围删除指定元素
 * @param {range} range
 */
export const removeElement = range => {
  const { model } = window.editor || window.devEditor;

  console.log(
    "%c🍉Lee%cline:55%crangeRemove",
    "color:#fff;background:#ee6f57;padding:3px;border-radius:2px",
    "color:#fff;background:#1f3c88;padding:3px;border-radius:2px",
    "color:#fff;background:rgb(89, 61, 67);padding:3px;border-radius:2px",
    range
  );
  model.change(writer => {
    writer.remove(range);
  });
};

/** safe Json Stringify */
export const safeJsonStringify = target => {
  try {
    return JSON.stringify(target);
  } catch (error) {
    console.error(error);
    return "";
  }
};

/** safe Json Parse */
export const safeJsonParse = jsonStr => {
  try {
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error(error);
    return {};
  }
};
