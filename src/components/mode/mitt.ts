import mitt from "mitt";
export interface Option {
  label: string | number;
  value: string | number | boolean;
}
export const emitter = mitt();

/**   emitter事件
 * ====================*/
/** 切换Modal展示 */
export const SWITCH_MODAL = "switchModal";
/**  获取OPTIONS list*/
export const GET_OPTIONS = "getOptions";
