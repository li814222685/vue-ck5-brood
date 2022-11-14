import mitt from "mitt";
export interface Option {
  label: string;
  value: string | number | boolean;
}
export const emitter = mitt();

/**   emitter事件
 * ====================*/
/** 切换Modal展示 */
export const SWITCH_MODAL = "switchModal";
/**  设置OPTIONS list*/
export const SET_OPTIONS = "setOptions";
/**  Normal：缓存需要 设置的元素*/
export const SET_TARGET = "setTarget";
/**  缓存隐藏元素 */
export const SAVE_HIDDEN_ITEM = "saveHiddenItem";
/**  替换隐藏元素的Text */
export const REPLACE_HIDDEN_ITEM_TEXT = "replaceHiddenItemText";
