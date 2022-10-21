import { Element } from "@ckeditor/ckeditor5-engine";
import Selection from "@ckeditor/ckeditor5-engine/src/model/selection";
import { CUSTOM_PROPERTY__SELECT } from "./constant";

/** 获取选中的控件 */
export function getSelectedWidget(selection: Selection) {
  const viewElement = selection.getSelectedElement();
  if (viewElement && isControls(viewElement)) {
    return viewElement;
  }
  return null;
}
/** 视图元素是否为自定义控件 */
const isControls = (viewElement: Element): boolean => {
  return viewElement.getAttribute(CUSTOM_PROPERTY__SELECT) as boolean;
};
